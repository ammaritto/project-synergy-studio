import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, ArrowLeft } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OyOlKHPQLrJ23OdgYVKEVQEfNbllzaDKaQ9BvuRDmqg1bEMcYElVTPvXA5pA7jMGQMNAAMfMdB2U9SX5oXdaLTk00z3yJ2Dzv');

interface BookingDetails {
  guestName: string;
  checkIn: string;
  checkOut: string;
  propertyName: string;
  nights: number;
}

interface InlineStripePaymentFormProps {
  totalAmount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  bookingDetails: BookingDetails;
}

interface CheckoutFormProps {
  totalAmount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  bookingDetails: BookingDetails;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  totalAmount, 
  currency, 
  onPaymentSuccess, 
  onBack, 
  bookingDetails 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    }

    setIsLoading(false);
  };

  const formatCurrency = (amount: number): string => {
    try {
      const num = parseFloat(amount?.toString() || '0') || 0;
      return `${num.toLocaleString('sv-SE')} SEK`;
    } catch (e) {
      return '0 SEK';
    }
  };

  const formatDateWithWeekday = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      return date.toLocaleDateString('en-GB', options);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
              disabled={isLoading}
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Complete Payment</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Guest:</span>
                  <span className="ml-2 text-gray-600">{bookingDetails.guestName}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Property:</span>
                  <span className="ml-2 text-gray-600">{bookingDetails.propertyName}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Check-in:</span>
                  <span className="ml-2 text-gray-600">{formatDateWithWeekday(bookingDetails.checkIn)}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Check-out:</span>
                  <span className="ml-2 text-gray-600">{formatDateWithWeekday(bookingDetails.checkOut)}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="ml-2 text-gray-600">{bookingDetails.nights} {bookingDetails.nights === 1 ? 'night' : 'nights'}</span>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <div className="text-right">
                      <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                      <div className="text-xs text-gray-500 font-normal">(VAT incl.)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <PaymentElement 
                    options={{
                      layout: "tabs"
                    }}
                  />
                </div>

                {/* Security Notice */}
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <Lock className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>Your payment information is secure and encrypted using industry-standard SSL technology</span>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!stripe || isLoading}
                  className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
                    !stripe || isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Complete Payment - ${formatCurrency(totalAmount)}`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InlineStripePaymentForm: React.FC<InlineStripePaymentFormProps> = ({
  totalAmount,
  currency,
  onPaymentSuccess,
  onBack,
  bookingDetails
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const formatCurrency = (amount: number): string => {
    try {
      const num = parseFloat(amount?.toString() || '0') || 0;
      return `${num.toLocaleString('sv-SE')} SEK`;
    } catch (e) {
      return '0 SEK';
    }
  };

  const formatDateWithWeekday = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      return date.toLocaleDateString('en-GB', options);
    } catch (e) {
      return dateString;
    }
  };

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('https://short-stay-backend.vercel.app/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currency,
          bookingDetails: bookingDetails
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.clientSecret);
        setShowPaymentForm(true);
      } else {
        setError(data.error || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleInitiatePayment();
  }, [totalAmount, currency]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">Preparing payment...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !showPaymentForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-8">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Payment Error</h1>
            </div>

            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
              {error}
            </div>

            <button
              onClick={handleInitiatePayment}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (clientSecret && showPaymentForm) {
    const options = {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
      },
    };

    return (
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm 
          totalAmount={totalAmount}
          currency={currency}
          onPaymentSuccess={onPaymentSuccess}
          onBack={onBack}
          bookingDetails={bookingDetails}
        />
      </Elements>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Ready to Complete Payment</h1>
            <p className="text-gray-600 mb-8">Click below to proceed with your secure payment</p>
            
            <button
              onClick={handleInitiatePayment}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue to Payment - {formatCurrency(totalAmount)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineStripePaymentForm;