import React, { useState, useEffect } from 'react';
import { PaymentElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, Lock, ArrowLeft, Shield, CreditCard, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  totalAmount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  bookingDetails: {
    guestName: string;
    checkIn: string;
    checkOut: string;
    propertyName: string;
    nights: number;
    guests: number;
  };
}

const CheckoutForm: React.FC<{
  onPaymentSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  totalAmount: number;
  currency: string;
}> = ({
  onPaymentSuccess,
  onBack,
  totalAmount,
  currency
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setProcessing(true);
    setError('');
    const {
      error: submitError,
      paymentIntent
    } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/booking-complete'
      },
      redirect: 'if_required'
    });
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    } else {
      setError('Payment was not successful. Please try again.');
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Payment Element Container */}
      <div className="card-elegant p-6">
        <div className="flex items-center mb-4">
          <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
        </div>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                email: '',
                phone: ''
              }
            }
          }} 
          className="mb-4" 
        />
      </div>

      {/* Security Notice */}
      <div className="flex items-center text-sm text-gray-600 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
        <Shield className="w-5 h-5 mr-3 text-green-600 flex-shrink-0" />
        <div>
          <div className="font-medium text-green-800">Secure Payment</div>
          <div className="text-green-600 text-xs">Your payment is protected by 256-bit SSL encryption and Stripe security</div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start animate-fade-in">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Payment Error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button 
          type="submit" 
          disabled={!stripe || processing} 
          className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center" 
          style={{
            backgroundColor: '#1461E2',
            color: 'white'
          }}
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <>
              Complete Payment
            </>
          )}
        </button>
        <button 
          type="button" 
          onClick={onBack} 
          disabled={processing} 
          className="w-full bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>
    </form>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  totalAmount,
  currency,
  onPaymentSuccess,
  onBack,
  bookingDetails
}) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDateWithWeekday = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/payment/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currency,
          bookingDetails: bookingDetails
        })
      });
      const data = await response.json();
      if (data.success) {
        setClientSecret(data.clientSecret);
        setShowPaymentForm(true);
      } else {
        setError(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '6px',
        borderRadius: '12px',
        focusBoxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    }
  } : undefined;

  return (
    <div 
      className="min-h-screen py-8 px-4 bg-[#FCFBF7]"
      data-content-section="payment-form" 
      data-visible="true"
    >
      <div className="bg-white rounded-lg shadow-lg p-8 animate-slide-up max-w-6xl mx-auto">
        <div className="pt-[10px] pb-[10px] grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-full">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Secure Payment</h1>
            
            {/* Booking Summary */}
            <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 w-full md:w-3/4 mx-auto">
              <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mr-2 md:mr-3" />
                Booking Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Booked studio:</span>
                  <span className="text-xs md:text-sm font-medium text-right">{bookingDetails.propertyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Guest:</span>
                  <div className="text-right">
                    <div className="text-xs md:text-sm font-medium">{bookingDetails.guestName}</div>
                    <div className="text-xs md:text-sm text-gray-600">{bookingDetails.guests} {bookingDetails.guests === 1 ? 'guest' : 'guests'}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Arrival Date:</span>
                  <span className="text-xs md:text-sm font-medium">{formatDateWithWeekday(bookingDetails.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Departure Date:</span>
                  <span className="text-xs md:text-sm font-medium">{formatDateWithWeekday(bookingDetails.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Duration:</span>
                  <span className="text-xs md:text-sm font-medium">{bookingDetails.nights} {bookingDetails.nights === 1 ? 'night' : 'nights'}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm md:text-xl font-bold">
                    <span>Total:</span>
                    <div className="text-right">
                      <div className="text-lg md:text-2xl">{formatCurrency(totalAmount)}</div>
                      <div className="text-xs md:text-sm text-gray-500 font-normal">VAT included</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <br />

            {/* Payment Form */}
            <div className="bg-white">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start animate-fade-in">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Payment Error</div>
                    <div className="text-sm mt-1">{error}</div>
                  </div>
                </div>
              )}

              {!showPaymentForm ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Ready to Complete Your Booking?</h2>
                    <p className="text-sm md:text-base text-gray-600 mb-6">Click below to proceed with secure payment</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 mb-6">
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium text-green-800">Secure Payment by Stripe</div>
                        <div className="text-green-600">Your payment information is encrypted and secure</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 mb-4 justify-center">
                    <Checkbox 
                      id="terms" 
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                      By proceeding with the payment, I accept the{' '}
                      <a 
                        href="https://allihoop.webflow.io/terms-and-conditions" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 underline hover:text-blue-800 transition-colors"
                      >
                        Allihoop Terms & Conditions
                      </a>
                    </label>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleInitiatePayment} 
                      disabled={loading || !termsAccepted} 
                      className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center" 
                      style={{
                        backgroundColor: termsAccepted ? '#1461E2' : '#94a3b8',
                        color: 'white'
                      }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          Complete Payment
                        </>
                      )}
                    </button>

                    <button 
                      onClick={onBack} 
                      disabled={loading} 
                      className="w-full bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                clientSecret && options && (
                  <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm 
                      onPaymentSuccess={onPaymentSuccess} 
                      onBack={onBack} 
                      totalAmount={totalAmount} 
                      currency={currency} 
                    />
                  </Elements>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentForm;