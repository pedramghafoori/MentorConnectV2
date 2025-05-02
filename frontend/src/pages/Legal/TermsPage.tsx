import React from 'react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <section className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-light text-[#4a1d1d] mb-8">Terms of Service</h1>
          
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">1. Independent-Contractor Relationship</h2>
            <p className="text-gray-700 leading-relaxed">
              The platform only introduces mentors and mentees. Each mentor is an independent contractor, not an employee, partner, joint-venturer or agent of LGA Mentor Connect Inc. ("Company").
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">2. No Professional Advice / No Guarantee</h2>
            <p className="text-gray-700 leading-relaxed">
              Content provided by mentors is for educational purposes. Neither mentors nor Company guarantee that use of the Service will result in certification, job placement or any other outcome.
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">3. Assumption of Risk</h2>
            <p className="text-gray-700 leading-relaxed">
              Some courses involve physical activity (e.g., pool sessions). You voluntarily accept all risks, including injury, property damage or death, that may arise from attending or instructing a course.
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">4. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, Company's aggregate liability to any user will not exceed the greater of (a) CAD 100 or (b) the total fees you paid to Company in the twelve months preceding the claim. Company is not liable for indirect, incidental, special, punitive or consequential damages.
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">5. Platform-Only Payments</h2>
            <p className="text-gray-700 leading-relaxed">
              Payments are processed by Stripe. Company never holds users' funds and disclaims liability for payment processing errors once a payment has left its systems.
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">6. Taxes</h2>
            <p className="text-gray-700 leading-relaxed">
              Mentors are solely responsible for remitting GST/HST, income tax and any other applicable taxes. Mentees are responsible for any taxes applied to their purchases.
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">7. Age & Capacity</h2>
            <p className="text-gray-700 leading-relaxed">
              You must be 18 years or older and legally capable of entering contracts to use the Service.
            </p>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">8. Governing Law & Forum</h2>
            <p className="text-gray-700 leading-relaxed">
              The Agreement is governed by the laws of Ontario and the federal laws of Canada applicable therein. Disputes shall be litigated exclusively in the courts of Toronto, Ontario.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#b32] mb-4 tracking-wide">9. Modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              Company may amend these Terms on 30 days' notice. Continued use after the effective date constitutes acceptance.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsPage; 