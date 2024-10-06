'use client';
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ActionCard from './ActionCard';
import Link from 'next/link';
import InputWrapper from './InputWrapper';
import Button from './Button';
import LogoFiller from './LogoFiller';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/firebase';
import { doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from './Modal';

export default function SimulationCase() {
  let defaultCaseData = {
    caseTitle: '',
    caseDescription: '',
    skillLevel: '',
    category: '',
    id: '',
    feedback: '',
    attachments: [],
    dateCreated: '',
  };

  const [caseMeta, setCaseMeta] = useState(defaultCaseData);
  const [attachmentPostings, setAttachmentPostings] = useState([]);
  const [caseID, setCaseID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [error, setError] = useState(null);
  const [displayedFeedback, setDisplayedFeedback] = useState('');
  const [feedbackIndex, setFeedbackIndex] = useState(0);

  const { userDataObj, currentUser, setUserDataObj } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  function getLabel(entry) {
    const labels = {
      caseTitle: 'Simulation Title',
      skillLevel: 'Skill Level',
      category: 'Category',
      caseDescription: 'Case Description',
    };
    return labels[entry] || entry;
  }

  // Function to generate brief using the backend API
  const generateBrief = async () => {
    const { caseDescription, category, skillLevel } = caseMeta;

    if (!caseDescription || !category || !skillLevel) {
      setError('Please provide case description, category, and skill level.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDisplayedFeedback('');
    setFeedbackIndex(0);

    try {
      console.log('Fetching from URL:', '/api/generateBrief');
      const response = await fetch('/api/generateBrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDescription, category, skillLevel }),
      });
      

      if (!response.ok) {
        throw new Error('Failed to generate brief');
      }

      const data = await response.json();
      const feedback = data.brief;

      setCaseMeta((prev) => ({ ...prev, feedback }));
    } catch (err) {
      console.error(err);
      setError('Failed to generate brief.');
    } finally {
      setIsLoading(false);
    }
  };

  // Typing effect for feedback
  useEffect(() => {
    if (feedbackIndex < caseMeta.feedback.length) {
      const timeout = setTimeout(() => {
        setDisplayedFeedback((prev) => prev + caseMeta.feedback[feedbackIndex]);
        setFeedbackIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [feedbackIndex, caseMeta.feedback]);

  function updateCaseData(type, val) {
    setCaseMeta((prev) => {
      const updatedCaseMeta = { ...prev, [type]: val };
      return updatedCaseMeta;
    });
  }

  const onDrop = async (acceptedFiles) => {
    uploadAttachments(acceptedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [], 'image/jpeg': [], 'image/png': [] },
    multiple: true,
  });

  const uploadAttachments = async (attachmentFiles) => {
    setIsLoading(true);
    setError(null);

    try {
      const urls = await Promise.all(
        attachmentFiles.map(async (file) => {
          const storageRef = ref(storage, `attachments/${file.name}`);
          await uploadBytes(storageRef, file);
          const attachmentUrl = await getDownloadURL(storageRef);
          return attachmentUrl;
        })
      );
      setAttachmentPostings((prev) => [...prev, ...urls]);

      const casesRef = doc(db, 'cases', caseMeta.id);
      await updateDoc(casesRef, {
        'caseMeta.attachments': [...caseMeta.attachments, ...urls],
      });
    } catch (error) {
      console.error('Error uploading attachments: ', error);
      setError('Failed to upload attachments');
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
    if (!caseID || caseID.length < 5) {
      return;
    }
    router.push('/admin/case?id=' + caseID);
  }

  useEffect(() => {
    setCaseMeta((prev) => ({ ...prev, caseTitle: caseID }));
  }, [caseID]);

  useEffect(() => {
    if (!userDataObj || !searchParams) {
      return;
    }
    const caseName = searchParams.get('id');
    let cases = userDataObj?.cases || {};
    if (!caseName) {
      return;
    }
    setCaseMeta((curr) => ({ ...curr, id: caseName, caseTitle: caseName }));
    if (!(caseName in cases)) {
      return;
    }
    const caseData = cases[caseName];
    const { caseMeta: localCaseMeta, feedback: localFeedback } = caseData;
    localCaseMeta && setCaseMeta(localCaseMeta);
    localFeedback && setCaseMeta((curr) => ({ ...curr, feedback: localFeedback }));
    setAttachmentPostings(localCaseMeta?.attachments || []);
  }, [userDataObj, searchParams]);

  async function handleSaveCase() {
    setIsLoading(true);

    try {
      const currData = localStorage.getItem('cases')
        ? JSON.parse(localStorage.getItem('cases'))
        : {};
      const newCase = {
        [caseMeta.id]: {
          caseMeta: {
            ...caseMeta,
            attachments: attachmentPostings,
            dateCreated: new Date().toISOString(),
          },
          feedback: caseMeta.feedback,
        },
      };

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        cases: {
          ...(currData.cases || {}),
          ...newCase,
        },
      });

      const casesRef = doc(db, 'cases', caseMeta.id);
      await setDoc(casesRef, newCase);

      const newData = {
        ...currData,
        cases: { ...(currData.cases || {}), ...newCase },
      };
      localStorage.setItem('cases', JSON.stringify(newData));
      setUserDataObj((curr) => ({ ...curr, cases: newData.cases }));

      router.push('/admin/simulation');
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
      const casesRef = doc(db, 'cases', caseMeta.id);
      await deleteDoc(casesRef);

      const newData = { ...userDataObj };
      delete newData.cases[caseMeta.id];
      setUserDataObj(newData);
      localStorage.setItem('cases', JSON.stringify(newData));

      router.push('/admin');
    } catch (error) {
      console.error('Failed to delete case:', error);
      setError('Failed to delete case');
    } finally {
      setIsLoading(false);
    }
  };

  function sortDetails(arr) {
    const order = ['caseDescription', 'caseTitle', 'skillLevel', 'category'];
    return [...arr].sort((a, b) => {
      return order.indexOf(a) - order.indexOf(b);
    });
  }

  const modalContent = {
    confirmed: (
      <div className='flex flex-1 flex-col gap-4'>
        <p className='font-medium text-lg sm:text-xl md:text-2xl'>Simulation Case Generator</p>
        <p>You have free simulations remaining.</p>
        <p className='flex-1'>
          Upgrading your account allows <b>unlimited</b> simulations! <br />
          <Link className='blueGradient' href={'/admin/billing'}>
            Upgrade here &rarr;
          </Link>
        </p>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => {
              setShowModal(null);
            }}
            className='w-fit p-4 rounded-full mx-auto bg-white border border-solid border-blue-100 px-8 duration-200 hover:opacity-70'
          >
            Go back
          </button>
          <Button text={'Confirm generation'} clickHandler={() => {}} />
        </div>
      </div>
    ),
    blocked: (
      <div className='flex flex-1 flex-col gap-4'>
        <p className='font-medium text-lg sm:text-xl md:text-2xl'>
          You&apos;ve used up your free simulations!
        </p>
        <p>Please upgrade your account to continue using this feature.</p>
        <p className=''>
          <i>You can also use the Copy Prompt feature to generate a case via your own ChatGPT instance.</i>
        </p>
        <p className='flex-1'>
          Upgrading your account also allows you to create and manage numerous additional cases!
        </p>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => {
              setShowModal(null);
            }}
            className='w-fit p-4 rounded-full mx-auto bg-white border border-solid border-blue-100 px-8 duration-200 hover:opacity-60'
          >
            Go back
          </button>
          <Button text={'Upgrade account'} clickHandler={() => router.push('/admin/billing')} />
        </div>
      </div>
    ),
  };

  return (
    <>
      {showModal && (
        <Modal handleCloseModal={() => setShowModal(null)}>{modalContent[showModal]}</Modal>
      )}
      {!caseMeta.id ? (
        <>
          <ActionCard title={'New Simulation Case'} lgHeader noFlex>
            <p className=''>Provide a unique ID for your simulation case!</p>
            <p className='font-medium'>Simulation Case ID</p>
            <div className='flex flex-col gap-1'>
              <p className='opacity-40 text-xs sm:text-sm italic'>
                • This ID cannot be repurposed.
              </p>
              <p className='opacity-40 text-xs sm:text-sm italic'>
                • ID must be at least 5 characters.
              </p>
            </div>
            <input
              value={caseID}
              onChange={(e) => {
                setCaseID(e.target.value);
              }}
              className='bg-white border rounded border-solid border-blue-950 w-full outline-none p-2'
              placeholder='Enter your Simulation Case name'
            />
            <div className='flex items-stretch justify-between gap-4'>
              <Link
                href={'/admin'}
                className='flex items-center mr-auto justify-center gap-4 bg-white border border-solid border-blue-950 px-4 py-2 rounded border-x-2 border-y-2 test-blue-950 duration-200 hover:bg-blue-950 hover:text-white'
              >
                <p className=''>&larr; Back</p>
              </Link>
              <button
                onClick={handleSubmitCase}
                className='flex items-center justify-center gap-2 border border-solid border-white bg-slate-50 px-3 py-2 rounded test-blue-950 duration-200 hover:bg-blue-950 hover:text-white '
              >
                <p className=''>Create</p>
                <i className='fa-regular fa-circle-check'></i>
              </button>
            </div>
          </ActionCard>
          <LogoFiller />
        </>
      ) : (
        <div className='flex flex-col gap-8 flex-1'>
          <div className='flex items-center justify-between gap-4'>
            <Link
              href={'/admin'}
              className='flex items-center mr-auto justify-center gap-4 bg-white border border-solid border-blue-950 px-4 py-2 rounded border-x-2 border-y-2 test-blue-950 duration-200 hover:bg-blue-950 hover:text-white'
            >
              <p className=''>&larr; Back</p>
            </Link>
            <button
              onClick={handleSaveCase}
              className='flex items-center justify-center gap-2 border border-solid border-white bg-slate-50 px-3 py-2 rounded text-blue-950 duration-200 hover:bg-blue-950 hover:text-white'
            >
              <p className=''>{isLoading ? 'Saving' : 'Start Simulation'}</p>
              <i className='fa-solid fa-upload'></i>
            </button>
          </div>
          <ActionCard title={'Simulation Case Details'} subTitle={caseMeta.id}>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {sortDetails(
                Object.keys(caseMeta).filter(
                  (val) =>
                    val !== 'id' &&
                    val !== 'attachments' &&
                    val !== 'dateCreated' &&
                    val !== 'feedback'
                )
              ).map((entry, entryIndex) => {
                return (
                  <div className='flex flex-col' key={entryIndex}>
                    <label className='font-medium mb-1'>{getLabel(entry)}</label>
                    {entry === 'skillLevel' ? (
                      <select
                        value={caseMeta.skillLevel}
                        onChange={(e) => updateCaseData('skillLevel', e.target.value)}
                        className='p-2 border border-solid border-slate-100 rounded-lg w-full bg-white'
                      >
                        <option value='' disabled>
                          Select Skill Level
                        </option>
                        {[
                          'Beginner',
                          'Intermediate',
                          'Advanced',
                          'Expert',
                          'Master',
                          'Scholar',
                        ].map((level, levelIndex) => (
                          <option value={level} key={levelIndex}>
                            {level}
                          </option>
                        ))}
                      </select>
                    ) : entry === 'category' ? (
                      <select
                        value={caseMeta.category}
                        onChange={(e) => updateCaseData('category', e.target.value)}
                        className='p-2 border border-solid border-slate-100 rounded-lg w-full bg-white'
                      >
                        <option value='' disabled>
                          Select Category
                        </option>
                        <option value='Criminal'>Criminal</option>
                        <option value='Intellectual Property'>Intellectual Property</option>
                        <option value='Family Law'>Family Law</option>
                        <option value='Contract'>Contract</option>
                        <option value='Employment'>Employment</option>
                        <option value='Corporate'>Corporate</option>
                      </select>
                    ) : entry === 'caseDescription' ? (
                      <textarea
                        className='p-2 border border-solid border-slate-100 rounded-lg w-full bg-white'
                        placeholder='Enter the case description'
                        value={caseMeta[entry]}
                        onChange={(e) => updateCaseData(entry, e.target.value)}
                      />
                    ) : entry === 'caseTitle' ? (
                      <input
                        className='p-2 border border-solid border-slate-100 rounded-lg w-full bg-white'
                        value={caseMeta.caseTitle}
                        readOnly
                      />
                    ) : (
                      <input
                        className='p-2 border border-solid border-slate-100 rounded-lg w-full bg-white'
                        value={caseMeta[entry]}
                        onChange={(e) => updateCaseData(entry, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-6">
            <button
              onClick={generateBrief}
              className=' justify-center before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56'
              disabled={isLoading}
            >
              {isLoading ? 'Generating Brief...' : 'Generate Brief'}
            </button>
            </div>
            {error && <p className='text-red-500'>{error}</p>}
          </ActionCard>
          <ActionCard title={'Case Brief'}>
            <InputWrapper value={displayedFeedback}>
              <textarea
                value={displayedFeedback}
                readOnly
                placeholder='The brief will appear here after generation...'
                className='unstyled h-full resize-none absolute inset-0 max-h-[600px]'
              ></textarea>
            </InputWrapper>
          </ActionCard>
          {caseMeta.id && (
            <div className='grid grid-cols-3 gap-4 sm:w-fit'>
              <button
                onClick={handleSaveCase}
                className='flex items-center justify-center gap-2 border border-solid border-blue-950 bg-white p-4 rounded text-blue-950 duration-200 hover:bg-blue-950 hover:text-white'
              >
                <p className=''>{isLoading ? 'Saving' : 'Save Case'}</p>
                <i className='fa-solid fa-floppy-disk'></i>
              </button>
              <Link
                href={'/case/' + caseMeta.id}
                target='_blank'
                className={
                  'flex items-center justify-center gap-2 border border-solid  border-blue-950 bg-white p-4 rounded text-blue-950 duration-200 hover:bg-blue-950 hover:text-white' +
                  (!caseMeta.caseDescription || !caseMeta.caseTitle ? 'hover:text-white' : '')
                }
              >
                <p className='hover:text-white'>PDF Viewer</p>
                <i className='fa-solid fa-arrow-up-right-from-square'></i>
              </Link>
              <button
                onClick={handleDeleteCase}
                className='flex items-center justify-center gap-2 border border-solid border-red-500 bg-white p-4 rounded text-red-500 duration-200 hover:bg-red-500 hover:text-white'
              >
                <p className=''>Delete Case</p>
                <i className='fa-solid fa-trash'></i>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
