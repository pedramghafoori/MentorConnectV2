import React from 'react';

const MentorAgreementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <section className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-light text-[#4a1d1d] mb-8">Mentor Agreement</h1>
          
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">1. Independent Contractor</h2>
            <p className="text-gray-700 leading-relaxed">
              Mentors set their own prices, schedules, teaching methods and are responsible for carrying business insurance appropriate to their activities.
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">2. No Employment Benefits</h2>
            <p className="text-gray-700 leading-relaxed">
              Mentors are not entitled to vacation pay, WSIB, EI or CPP contributions from Company.
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">3. Background Checks</h2>
            <p className="text-gray-700 leading-relaxed">
              By signing up you certify that you hold any legally required certifications (e.g., NL Instructor) and agree to provide proof on request.
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">4. Tax Compliance</h2>
            <p className="text-gray-700 leading-relaxed mb-4">If you charge HST/GST you must:</p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>flip the "Collect HST" toggle in your profile;</li>
              <li>enter a valid CRA number; and</li>
              <li>include applicable tax in the price you set.</li>
            </ul>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">5. Indemnity</h2>
            <p className="text-gray-700 leading-relaxed">
              You indemnify and hold Company harmless against claims arising from your instruction, negligence or breach of these Terms.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">6. Cancellation & Refunds</h2>
            <p className="text-gray-700 leading-relaxed">
              Mentor agrees to honour the cancellationPolicyHours they set. Failure may result in withholding of payouts or de-listing.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MentorAgreementPage; 