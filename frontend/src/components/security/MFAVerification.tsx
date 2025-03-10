import React, { useState } from 'react';

interface MFAVerificationProps {
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({ onVerify, onCancel }) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const success = await onVerify(code);
      if (!success) {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Two-Factor Authentication</h2>
      <p className="text-gray-400 mb-6">Enter the verification code from your authenticator app to continue.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium mb-1">Verification Code</label>
          <input
            type="text"
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="6-digit code"
            maxLength={6}
            autoComplete="one-time-code"
          />
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            disabled={isVerifying}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bright-green-bg text-black hover:bg-green-400 rounded-md transition-colors flex items-center"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MFAVerification;
