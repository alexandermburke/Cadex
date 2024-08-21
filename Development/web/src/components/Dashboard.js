'use client'
import { useAuth } from '@/context/AuthContext';
import { Poppins, Open_Sans } from 'next/font/google';
import React, { useEffect, useState } from 'react';
import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';
import ActionCard from './ActionCard';
import LogoFiller from './LogoFiller';
import sortResumeSections from '@/utils';
import Modal from './Modal';
import Button from './Button';
import { useRouter } from 'next/navigation';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });
const opensans = Open_Sans({
    subsets: ["latin"], weight: ['400', '300', '500', '600', '700'], style: ['normal', 'italic'],
});

const completionSteps = [
    ['Complete your case', 'fa-solid fa-pen-to-square', 'Fill out your case details in the display below by adding all the sections relevant to the case. You can view your case by selecting the PDF Viewer button below, and can print the web page to a PDF that you can save to your local device. Be sure to adjust the print scale to get the perfect PDF fit.'],
    ['Upload attachments', 'fa-solid fa-scroll', 'Once you have completed your case details, add any relevant attachments. Once you have added the details and attachments, you can generate your perfect case and make any final adjustments.'],
    ['Share your link', 'fa-solid fa-share', 'With your case details complete and saved, you can publish your case and share a live version at your special link. You can share this link with anyone!']
];

export default function Dashboard() {
    const [completedSteps, setCompletedSteps] = useState([]);
    let defaultUserData = { name: '', email: '', website: '', location: '' };
    const [userData, setUserData] = useState(defaultUserData);
    const [changedData, setChangedData] = useState(false);
    const [caseSections, setCaseSections] = useState([]);
    const [addSection, setAddSection] = useState(false);
    const [showModal, setShowModal] = useState(null);
    const [caseToDelete, setCaseToDelete] = useState('');
    const [instruction, setInstruction] = useState(null);
    const [savingUserDetails, setSavingUserDetails] = useState(false);
    const [savingCase, setSavingCase] = useState(false);
    const [publishingCase, setPublishingCase] = useState(false); // show in modal
    const [nextFocusElement, setNextFocusElement] = useState(null);

    const router = useRouter();

    const { currentUser, loading, userDataObj, setUserDataObj, isPaid } = useAuth();
    let numberOfCases = Object.keys(userDataObj?.cases || {}).length;

    async function handleSaveCase() {
        if (savingCase) { return }

        let currData = localStorage.getItem('cases');

        if (currData) {
            currData = JSON.parse(currData);
        } else {
            currData = {};
        }

        try {
            setSavingCase(true);
            let newData = { ...currData, caseSections };
            setUserDataObj(curr => ({ ...curr, caseSections }));
            localStorage.setItem('cases', JSON.stringify(newData));
            const userRef = doc(db, 'users', currentUser.uid);
            const res = await setDoc(userRef, { caseSections }, { merge: true });
            console.log(res);
        } catch (err) {
            console.log('Failed to save data\n', err.message);
        } finally {
            setSavingCase(false);
        }
    }

    function handleCreateCase() {
        if (numberOfCases >= 1) {
            return;
        }
        if (isPaid) {
            router.push('/admin/case');
            return;
        }

        if (numberOfCases >= 10) {
            setShowModal('cases');
            return;
        }
        router.push('/admin/case');
    }

    async function handleDeleteCase() {
        if (!caseToDelete || !(caseToDelete in userDataObj.cases)) { return; }

        const newCasesObj = { ...userDataObj.cases };
        delete newCasesObj[caseToDelete];

        try {
            const caseRef = doc(db, 'cases', caseToDelete);
            await deleteDoc(caseRef);

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                cases: newCasesObj
            });

            const newDataObj = { ...userData, cases: newCasesObj };

            setUserDataObj(newDataObj);
            localStorage.setItem('cases', JSON.stringify(newDataObj));
        } catch (err) {
            console.log('Failed to delete case', err.message);
        } finally {
            setShowModal(null);
            setCaseToDelete('');
        }
    }

    const modalContent = {
        cases: (
            <div className='flex flex-1 flex-col gap-4'>
                <p className='font-medium text-lg sm:text-xl md:text-2xl'>Case limit reached!</p>
                <p>Free accounts can manage up to 3 active cases.</p>
                <p className=''><i>Please either delete some cases, or upgrade your account to continue.</i></p>
                <p className='flex-1'>Upgrading your account allows you to manage up to <b>5</b> cases, and gives you access to auto <b> case reposting.</b></p>
                <div className='flex items-center gap-4'>
                    <button onClick={() => { setShowModal(null) }} className=' w-fit p-4 rounded-full mx-auto bg-white border border-solid border-blue-950 px-8 duration-200 hover:opacity-60'>Go back</button>
                    <Button text={'Upgrade Account'} clickHandler={() => { router.push('/admin/billing') }} />
                </div>
            </div>
        ),
        deleteCase: (
            <div>
                <div className='flex flex-1 flex-col gap-4'>
                    <p className='font-medium text-lg sm:text-xl md:text-2xl'>Are you sure you want to delete this case?</p>
                    <p className=''><i>Deleting a case is permanent!</i></p>
                    <p className='flex-1 capitalize'><b>Case ID</b> {caseToDelete.replaceAll('_', ' ')}</p>
                    <div className='flex items-center gap-4'>
                        <button onClick={() => { setShowModal(null) }} className=' p-4 rounded-full mx-auto bg-white border border-solid border-blue-950 text-blue-950  px-8 duration-200 hover:opacity-60'>Go back</button>
                        <button onClick={handleDeleteCase} className=' flex-1 p-4 text-pink-400 rounded-full mx-auto bg-white border border-solid border-pink-400 px-8 duration-200 hover:opacity-60'>Confirm Delete</button>
                    </div>
                </div>
            </div>
        )
    };

    useEffect(() => {
        if (!nextFocusElement) {
            return;
        }
        document.getElementById(nextFocusElement) && document.getElementById(nextFocusElement).focus();
        setNextFocusElement(null);
    }, [nextFocusElement]);

    useEffect(() => {
        if (!userDataObj) { return; }
        const { userData: localUserData, caseSections: localCaseSections } = userDataObj;
        localUserData && setUserData(localUserData);
        localCaseSections && setCaseSections(localCaseSections);
    }, [userDataObj]);

    return (
        <>
            {showModal && (
                <Modal handleCloseModal={() => { setShowModal(null) }}>
                    {modalContent[showModal]}
                </Modal>
            )}
            <div className='flex flex-col gap-8 flex-1'>

                <ActionCard title={'Cases'} actions={numberOfCases >= 20 ? null : (
                    <div className='flex items-center gap-4'>
                        {numberOfCases < 20 && (
                            <button onClick={handleCreateCase} className='flex items-center justify-center gap-4 border border-solid border-x-2 border-y-2 border-blue-950 px-4 py-2 rounded text-xs sm:text-sm text-blue-950 duration-200 hover:bg-blue-950 hover:text-white'>
                                <p className=''>Create New</p>
                            </button>
                        )}
                    </div>
                )}>
                    <div className='flex flex-col gap-2 overflow-x-scroll'>
                        <div className='grid grid-cols-4 shrink-0'>
                            {['Case ID', 'Title', 'Description', 'Skill Level'].map((label, labelIndex) => {
                                return (
                                    <div key={labelIndex} className='p-1 capitalize px-2 text-xs sm:text-sm font-medium'>
                                        <p className='truncate'>{label}</p>
                                    </div>
                                );
                            })}
                        </div>
                        {(Object.keys(userDataObj?.cases || {}) || []).map((caseName, caseIndex) => {
                            const Case = userDataObj?.cases?.[caseName] || {};
                            const { caseMeta, feedback } = Case;
                            return (
                                <div className='flex flex-col relative group ' key={caseIndex}>
                                    <button onClick={() => {
                                        setCaseToDelete(caseName);
                                        setShowModal('deleteCase');
                                    }} className='flex items-center justify-center gap-4 rounded-full text-xs sm:text-sm text-pink-400 duration-200 absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 group-hover:opacity-100 opacity-0 hover:text-pink-200'>
                                        <i className="fa-regular fa-trash-can"></i>
                                    </button>
                                    <Link href={'/admin/case?id=' + (caseMeta?.id || caseName)} className='grid shrink-0 capitalize grid-cols-4 border border-solid border-blue-100 duration-200 hover:bg-blue-50 rounded-lg overflow-hidden '>
                                        <div className='p-2'>
                                            <p className='truncate hover:text-blue-950'>{caseMeta?.id}</p>
                                        </div>
                                        <div className='p-2'>
                                            <p className='truncate'>{caseMeta?.caseTitle}</p>
                                        </div>
                                        <div className='p-2'>
                                            <p className='truncate'>{caseMeta?.caseDescription}</p>
                                        </div>
                                        <div className='p-2'>
                                            <p className='truncate'>{caseMeta?.skillLevel}</p>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </ActionCard>
                <div className='grid grid-cols-2 sm:w-fit gap-4'>
                <button onClick={handleSaveCase} className='relative flex items-center justify-center h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56'>
                  <div className='flex items-center space-x-1'>
               <p>{savingCase ? 'Saving ...' : 'Save Case'}</p>
              <i className="fa-solid fa-floppy-disk ml-8"></i>
             </div>
        </button>



                    <Link href={'/case?user=' + currentUser.displayName} target='_blank' className={'relative flex items-center justify-center h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56'}>
                        <p className=''>PDF Viewer</p>
                        <i className="fa-solid fa-arrow-up-right-from-square ml-8"></i>
                    </Link>
                </div>
            </div>
            <LogoFiller />
        </>
    );
}
