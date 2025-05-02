import React from 'react';

interface BookingTermsProps {
    cancellationPolicyHours: number;
    onAccept: (accepted: boolean) => void;
}

const BookingTerms = ({ cancellationPolicyHours, onAccept }: BookingTermsProps) => {
    return (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
                <input
                    type="checkbox"
                    id="bookingTerms"
                    className="mt-1 mr-2"
                    onChange={(e) => onAccept(e.target.checked)}
                />
                <label htmlFor="bookingTerms" className="text-sm text-gray-700">
                    By clicking "Pay & Book", you acknowledge that:
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>The mentor is an independent contractor who sets their own fees and requirements.</li>
                        <li>You have reviewed and will complete the "What to prepare" checklist supplied by the mentor.</li>
                        <li>Cancellations made less than {cancellationPolicyHours} hours before the course forfeit the mentor fee.</li>
                        <li>You assume all risks associated with participating in the course, including physical injury.</li>
                        <li>Any disputes will be resolved under Ontario law in the courts of Toronto.</li>
                    </ul>
                </label>
            </div>
        </div>
    );
};

export default BookingTerms; 