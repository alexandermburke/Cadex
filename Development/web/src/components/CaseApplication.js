'use client'
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ActionCard from './ActionCard';
import Link from 'next/link';
import InputWrapper from './InputWrapper';
import Button from './Button';
import LogoFiller from './LogoFiller';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/firebase';
import { doc, updateDoc, setDoc, collection, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from './Modal';

export default function CaseApplication() {
    let defaultCaseData = {
        caseTitle: '',
        caseDescription: '',
        skillLevel: '', // Easy, Medium, Hard
        id: '',
        feedback: '',
        attachments: [], // Array to store multiple attachment URLs
        dateCreated: '' // Add dateCreated to the caseMeta
    };
    
    const [caseMeta, setCaseMeta] = useState(defaultCaseData);
    const [attachmentPostings, setAttachmentPostings] = useState([]); // Array to store multiple attachment URLs
    const [caseID, setCaseID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSkillLevels, setShowSkillLevels] = useState(false);
    const [showModal, setShowModal] = useState(null);
    const [error, setError] = useState(null);

    const { userDataObj, currentUser, setUserDataObj } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const onDrop = async (acceptedFiles) => {
        uploadAttachments(acceptedFiles);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': [], 'image/jpeg': [], 'image/png': [] }, multiple: true });

    const uploadAttachments = async (attachmentFiles) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const urls = await Promise.all(attachmentFiles.map(async (file) => {
                const storageRef = ref(storage, `attachments/${file.name}`);
                await uploadBytes(storageRef, file);
                const attachmentUrl = await getDownloadURL(storageRef);
                return attachmentUrl;
            }));
            setAttachmentPostings(prev => [...prev, ...urls]);
            
            // Save the URLs to Firestore
            const casesRef = doc(db, 'cases', caseMeta.id);
            await updateDoc(casesRef, {
                'caseMeta.attachments': [...caseMeta.attachments, ...urls]
            });
        } catch (error) {
            console.error("Error uploading attachments: ", error);
            setError("Failed to upload attachments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files) {
            uploadAttachments(Array.from(files));
        }
    };

    function handleSubmitCase() {
        if (!caseID || caseID.length < 5) { return }
        router.push('/admin/case?id=' + caseID);
    }

    function updateCaseData(type, val) {
        setCaseMeta({ ...caseMeta, [type]: val });
    }

    async function handleSaveCase() {
        setIsLoading(true);
    
        try {
            const currData = localStorage.getItem('cases') ? JSON.parse(localStorage.getItem('cases')) : {};
            const newCase = {
                [caseMeta.id]: {
                    caseMeta: { ...caseMeta, attachments: attachmentPostings, dateCreated: new Date().toISOString() }, // Save the current date
                    feedback: caseMeta.feedback
                }
            };
    
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                cases: {
                    ...(currData.cases || {}),
                    ...newCase
                }
            });
    
            const casesRef = doc(db, 'cases', caseMeta.id);
            await setDoc(casesRef, newCase);
    
            const newData = { ...currData, cases: { ...(currData.cases || {}), ...newCase } };
            localStorage.setItem('cases', JSON.stringify(newData));
            setUserDataObj(curr => ({ ...curr, cases: newData.cases }));
        } catch (err) {
            console.error('Failed to save data:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteCase = async () => {
        if (!caseMeta.id) return;
        
        setIsLoading(true);

        try {
            // Delete the case from Firestore
            const casesRef = doc(db, 'cases', caseMeta.id);
            await deleteDoc(casesRef);

            // Update the local state
            const newData = { ...userDataObj };
            delete newData.cases[caseMeta.id];
            setUserDataObj(newData);
            localStorage.setItem('cases', JSON.stringify(newData));

            // Redirect to the cases page after deletion
            router.push('/admin');
        } catch (error) {
            console.error('Failed to delete case:', error);
            setError('Failed to delete case');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (!userDataObj || !searchParams) { return }
        const caseName = searchParams.get('id');
        let cases = userDataObj?.cases || {};
        if (!caseName) {
            return;
        }
        setCaseMeta(curr => ({ ...curr, id: caseName }));
        if (!(caseName in cases)) { return }
        const caseData = cases[caseName];
        const { caseMeta: localCaseMeta, feedback: localFeedback } = caseData;
        localCaseMeta && setCaseMeta(localCaseMeta);
        localFeedback && setCaseMeta(curr => ({ ...curr, feedback: localFeedback }));
        setAttachmentPostings(localCaseMeta?.attachments || []);
    }, [userDataObj, searchParams]);

    function sortDetails(arr) {
        const order = ['caseTitle', 'caseDescription', 'skillLevel', 'feedback', 'attachments'];
        return [...arr].sort((a, b) => {
            return order.indexOf(a) - order.indexOf(b);
        });
    }

    if (!caseMeta.id) {
        return (
            <>
                <ActionCard title={'New Case'} lgHeader noFlex>
                    <p className=''>Provide a unique ID for your case!</p>
                    <p className='font-medium'>Case ID</p>
                    <div className='flex flex-col gap-1'>
                        <p className='opacity-40 text-xs sm:text-sm italic'>• This ID cannot be repurposed.</p>
                        <p className='opacity-40 text-xs sm:text-sm italic'>• ID must be at least 5 characters.</p>
                    </div>
                    <input value={caseID} onChange={(e) => { setCaseID(e.target.value) }} className='bg-white border rounded-lg border-solid border-yellow-100 w-full outline-none p-2' placeholder='Enter the Case ID here' />
                    <div className='flex items-stretch justify-between gap-4'>
                        <Link href={'/admin'} className='flex items-center mr-auto justify-center gap-4 bg-white border border-solid border-yellow-100 px-4 py-2 rounded-full text-yellow-400 duration-200 hover:opacity-50'>
                            <p className=''>&larr; Back</p>
                        </Link>
                        <button onClick={handleSubmitCase} className='flex items-center justify-center gap-2 border border-solid border-white bg-yellow-50 px-3 py-2 rounded-full text-yellow-400 duration-200 hover:opacity-50'>
                            <p className=''>Create</p>
                            <i className="fa-regular fa-circle-check"></i>
                        </button>
                    </div>
                </ActionCard>
                <LogoFiller />
            </>
        );
    }

    const modalContent = {
        confirmed: (
            <div className='flex flex-1 flex-col gap-4'>
                <p className='font-medium text-lg sm:text-xl md:text-2xl'>Case generator</p>
                <p>You have free cases remaining.</p>
                <p className='flex-1'>Upgrading your account allows <b>unlimited</b> case generations! <br />
                    <Link className='blueGradient' href={'/admin/billing'}>Upgrade here &rarr;</Link></p>
                <div className='flex items-center gap-4'>
                    <button onClick={() => { setShowModal(null) }} className='w-fit p-4 rounded-full mx-auto bg-white border border-solid border-blue-100 px-8 duration-200 hover:opacity-70'>Go back</button>
                     <Button text={'Confirm generation'} clickHandler={() => {}} />
                </div>
            </div>
        ),
        blocked: (
            <div className='flex flex-1 flex-col gap-4'>
                <p className='font-medium text-lg sm:text-xl md:text-2xl'>You&apos;ve used up your free generations!</p>
                <p>Please upgrade your account to continue using this feature.</p>
                <p className=''><i>You can also use the Copy Prompt feature to generate a case via your own ChatGPT instance.</i></p>
                <p className='flex-1'>Upgrading your account also allows you to create and manage numerous additional cases!</p>
                <div className='flex items-center gap-4'>
                    <button onClick={() => { setShowModal(null) }} className='w-fit p-4 rounded-full mx-auto bg-white border border-solid border-blue-100 px-8 duration-200 hover:opacity-60'>Go back</button>
                    <Button text={'Upgrade account'} clickHandler={() => { router.push('/admin/billing') }} />
                </div>
            </div>
        )
    };

    return (
        <>
            {showModal && (
                <Modal handleCloseModal={() => { setShowModal(null) }}>
                    {modalContent[showModal]}
                </Modal>
            )}
            <div className='flex flex-col gap-8 flex-1'>
                <div className='flex items-center justify-between gap-4'>
                    <Link href={'/admin'} className='flex items-center mr-auto justify-center gap-4 bg-white px-4 py-2 rounded-full text-yellow-400 duration-200 hover:opacity-50'>
                        <p className=''>&larr; Back</p>
                    </Link>
                    <button onClick={handleSaveCase} className='flex items-center justify-center gap-2 border border-solid border-white bg-yellow-50 px-3 py-2 rounded-full text-yellow-400 duration-200 hover:opacity-50'>
                        <p className=''>{isLoading ? 'Uploading' : 'Upload'}</p>
                        <i className="fa-solid fa-upload"></i>
                    </button>
                </div>
                <ActionCard title={'Case Details'} subTitle={caseMeta.id}>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {sortDetails(Object.keys(caseMeta)).filter(val => val !== 'id' && val !== 'attachments' && val !== 'dateCreated').map((entry, entryIndex) => {
                            return (
                                <div className='flex items-center gap-4' key={entryIndex}>
                                    <p className='capitalize font-medium w-24 sm:w-32'>{entry}{['caseTitle', 'caseDescription'].includes(entry) ? '' : ''}</p>
                                    {entry === 'skillLevel' ? (
                                        <div className='flex flex-col gap-1 w-full relative'>
                                            <button onClick={() => {
                                                setShowSkillLevels(!showSkillLevels)
                                            }} className={'flex items-center gap-4 justify-between p-2 border border-solid border-slate-100 rounded-t-lg ' + (showSkillLevels ? '' : ' rounded-b-lg')}>
                                                <p className='capitalize'>{caseMeta.skillLevel || 'Select skill level'}</p>
                                                <i className="fa-solid fa-chevron-down"></i>
                                            </button>
                                            {showSkillLevels && (
                                                <div className='flex flex-col border-l rounded-b-lg border-b border-r border-solid border-slate-100 bg-white z-[10] absolute top-full left-0 w-full'>
                                                    {['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Scholar'].map((level, levelIndex) => {
                                                        return (
                                                            <button onClick={() => {
                                                                updateCaseData('skillLevel', level);
                                                                setShowSkillLevels(false);
                                                            }} className='p-2 capitalize' key={levelIndex}>
                                                                <p className={'duration-200 ' + (level === caseMeta.skillLevel ? 'font-medium' : '')}>{level}</p>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <input
                                            className='bg-transparent capitalize w-full outline-none border-none'
                                            placeholder={'Enter ' + entry}
                                            value={caseMeta[entry]}
                                            onChange={(e) => updateCaseData(entry, e.target.value)} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ActionCard>
                <ActionCard title={'Feedback'}>
                    <InputWrapper value={caseMeta.feedback}>
                        <textarea value={caseMeta.feedback} placeholder='Cadex AI will generate a briefing on the case here .. ' onChange={(e) => {
                            updateCaseData('feedback', e.target.value);
                        }} className='unstyled h-full resize-none absolute inset-0 max-h-[600px]'></textarea>
                    </InputWrapper>
                </ActionCard>
                <ActionCard title={'Attachments'}>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {attachmentPostings.map((url, index) => (
                            <div key={index} className="flex items-center justify-center">
                                <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500">View Attachment {index + 1}</a>
                            </div>
                        ))}
                    </div>
                    <input type="file" accept="application/pdf, image/jpeg, image/png" multiple onChange={handleFileChange} className="file-input" />
                    <p className='opacity-80 text-xs sm:text-sm italic'>Format: *.pdf, *.jpg, *.jpeg, *.png only</p>
                    <p className='opacity-80 text-xs sm:text-sm italic'>Please wait until all attachments are displayed before uploading</p>
                </ActionCard>
                {caseMeta.id && (
                    <div className='grid grid-cols-3 gap-4 sm:w-fit'>
                        <button onClick={handleSaveCase} className='flex items-center justify-center gap-2 border border-solid border-white bg-white p-4 rounded-full text-yellow-400 duration-200 hover:opacity-50'>
                            <p className=''>{isLoading ? 'Saving' : 'Save'}</p>
                            <i className="fa-solid fa-floppy-disk"></i>
                        </button>
                        <Link href={'/case/' + caseMeta.id} target='_blank' className={'flex items-center justify-center gap-2 border border-solid border-yellow-100 bg-white p-4 rounded-full text-yellow-400 duration-200 hover:opacity-50 ' + (!caseMeta.caseDescription || !caseMeta.caseTitle ? 'opacity-50' : '')}>
                            <p className=''>PDF Viewer</p>
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </Link>
                        <button onClick={handleDeleteCase} className='flex items-center justify-center gap-2 border border-solid bg-white p-4 rounded-full text-red-500 duration-200 hover:opacity-75'>
                            <p className=''>Delete</p>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
