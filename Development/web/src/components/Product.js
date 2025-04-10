'use client';

import React from 'react';

export default function FAQ() {
  return (
    <div className="relative w-full min-h-[60vh] bg-blue-950 drop-shadow-lg overflow-hidden flex items-center justify-center p-4">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl sm:text-7xl font-bold text-white">
          Common Questions
        </h1>
        <p className="text-xl sm:text-2xl text-gray-200 mb-10">
          Find answers to our most commonly asked questions.
        </p>
        
        {/* FAQ List */}
        <div className="space-y-8 text-left">
          {/* Question 1 */}
          <div className="border-l-4 border-blue-300 pl-4 py-2 transition transform hover:scale-[1.02]">
            <h2 className="font-semibold text-lg sm:text-xl mb-2 text-white">
              What is CadexLaw?
            </h2>
            <p className="text-sm sm:text-base text-gray-100">
              CadexLaw is a platform offering legal study tools, case briefs, and exam prep
              resources. It’s designed especially for law students seeking comprehensive
              support at affordable rates.
            </p>
          </div>

          {/* Question 2 */}
          <div className="border-l-4 border-blue-300 pl-4 py-2 transition transform hover:scale-[1.02]">
            <h2 className="font-semibold text-lg sm:text-xl mb-2 text-white">
              How do I sign up?
            </h2>
            <p className="text-sm sm:text-base text-gray-100">
              Visit our sign-up page, provide your details, and select a plan that meets
              your needs. You can switch between plans at any time.
            </p>
          </div>

          {/* Question 3 */}
          <div className="border-l-4 border-blue-300 pl-4 py-2 transition transform hover:scale-[1.02]">
            <h2 className="font-semibold text-lg sm:text-xl mb-2 text-white">
              What study tools do you offer?
            </h2>
            <p className="text-sm sm:text-base text-gray-100">
              We provide case summaries, flashcards, outlines, and enhanced exam prep.
              Our resource library expands continuously to meet the evolving needs of law
              students.
            </p>
          </div>

          {/* Question 4 */}
          <div className="border-l-4 border-blue-300 pl-4 py-2 transition transform hover:scale-[1.02]">
  <h2 className="font-semibold text-lg sm:text-xl mb-2 text-white">
    Do you offer support for legal systems outside of the U.S.?
  </h2>
  <p className="text-sm sm:text-base text-gray-100">
    No, at this time we’re focused exclusively on the U.S. legal system. However, we do have plans to expand our support services internationally in the future.
  </p>
</div>

        </div>
      </div>
    </div>
  );
}
