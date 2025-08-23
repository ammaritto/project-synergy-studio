import React from 'react';
import { CheckCircle } from 'lucide-react';
import { BookingDetails } from '../hooks/useBookingState';
interface BookingConfirmationProps {
  bookingDetails: BookingDetails;
  onReset: () => void;
}
const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingDetails,
  onReset
}) => {
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('sv-SE')} SEK`;
  };
  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };
  return <div className="min-h-screen py-8 px-4 bg-[#FCFBF7]">
    <div className="bg-white rounded-lg shadow-lg p-8 animate-slide-up max-w-6xl mx-auto">
      <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-3xl md:flex md:flex-col md:items-center md:justify-center md:min-h-[400px]">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Booking Confirmed & Paid!</h2>
        <div className="space-y-2 text-gray-600">
          <p><strong>Booking Reference:</strong> {bookingDetails.bookingReference}</p>
          <p><strong>Guest:</strong> {bookingDetails.guestName}</p>
          <p><strong>Check-in:</strong> {formatDisplayDate(bookingDetails.checkIn)}</p>
          <p><strong>Check-out:</strong> {formatDisplayDate(bookingDetails.checkOut)}</p>
          {bookingDetails.paymentReference && <p><strong>Payment Reference:</strong> {bookingDetails.paymentReference}</p>}
          {bookingDetails.paymentAmount && <p><strong>Amount Paid:</strong> {formatCurrency(bookingDetails.paymentAmount)}</p>}
        </div>
      </div>
    </div>
  </div>;
};
export default BookingConfirmation;