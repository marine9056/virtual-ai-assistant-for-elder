
import React, { useState } from 'react';
import { saveOrder } from '../services/supabase';
import { UserProfile } from '../types';

interface CheckoutProps {
  userProfile: UserProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ userProfile, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: userProfile.name.split(' ')[0] || '',
    lastName: userProfile.name.split(' ')[1] || '',
    email: '',
    streetAddress: '',
    city: '',
    zipCode: '',
    plan: 'Premium Monthly',
    cardHolder: userProfile.name || '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const plans = [
    { name: 'Basic Goldie', price: 0, desc: 'Voice chat & daily routines.' },
    { name: 'Premium Monthly', price: 15, desc: 'Image memories & deep stories.' },
    { name: 'Family Care', price: 40, desc: 'Connect up to 5 family members.' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-format card number
    if (name === 'cardNumber') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        setFormData(prev => ({ ...prev, [name]: parts.join(' ') }));
        return;
      }
    }

    // Auto-format Expiry (MM/YY)
    if (name === 'expiry') {
      const v = value.replace(/\//g, '').replace(/[^0-9]/gi, '');
      if (v.length <= 4) {
        const formatted = v.length >= 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
        setFormData(prev => ({ ...prev, [name]: formatted }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const selectedPlan = plans.find(p => p.name === formData.plan);
      
      await saveOrder({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        street_address: formData.streetAddress,
        city: formData.city,
        zip_code: formData.zipCode,
        product_name: formData.plan,
        total_amount: selectedPlan?.price || 0,
        card_holder_name: formData.cardHolder,
        payment_method: 'credit_card'
      });
      
      alert('Success! Your subscription is now active.');
      onSuccess();
    } catch (err: any) {
      setError('Payment failed. Please check your card details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white p-6 sm:p-12 rounded-[40px] senior-card border-4 border-sky-100 shadow-2xl">
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4">Secure Checkout</h2>
        <p className="text-xl sm:text-2xl text-slate-600 mb-10 font-bold italic">"Let's finalize your GoldenYears subscription."</p>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* SECTION 1: PLAN */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-800 border-b-4 border-sky-100 pb-2 flex items-center gap-3">
              <span className="bg-sky-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">1</span>
              Pick Your Plan
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {plans.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, plan: p.name }))}
                  className={`p-6 rounded-3xl border-4 text-left flex justify-between items-center transition-all ${
                    formData.plan === p.name ? 'border-sky-600 bg-sky-50 shadow-lg scale-[1.01]' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div>
                    <h4 className="text-2xl font-black text-slate-800">{p.name}</h4>
                    <p className="text-slate-500 font-bold">{p.desc}</p>
                  </div>
                  <div className="text-3xl font-black text-sky-600">
                    ${p.price}<span className="text-sm text-slate-400 block font-normal text-right">/mo</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: SHIPPING/ACCOUNT */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 border-b-4 border-sky-100 pb-2 flex items-center gap-3">
              <span className="bg-sky-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">2</span>
              Your Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-slate-700 font-black mb-1 text-lg">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-4 sm:p-5 rounded-2xl border-4 border-slate-200 bg-slate-50 text-xl font-bold" required />
              </div>
              <div className="text-left">
                <label className="block text-slate-700 font-black mb-1 text-lg">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-4 sm:p-5 rounded-2xl border-4 border-slate-200 bg-slate-50 text-xl font-bold" required />
              </div>
            </div>
            <div className="text-left">
              <label className="block text-slate-700 font-black mb-1 text-lg">Street Address</label>
              <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} placeholder="Where should we send updates?" className="w-full p-4 sm:p-5 rounded-2xl border-4 border-slate-200 bg-slate-50 text-xl font-bold" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="text-left">
                <label className="block text-slate-700 font-black mb-1 text-lg">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-4 sm:p-5 rounded-2xl border-4 border-slate-200 bg-slate-50 text-xl font-bold" required />
              </div>
              <div className="text-left">
                <label className="block text-slate-700 font-black mb-1 text-lg">Zip</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full p-4 sm:p-5 rounded-2xl border-4 border-slate-200 bg-slate-50 text-xl font-bold" required />
              </div>
            </div>
            <div className="text-left">
              <label className="block text-slate-700 font-black mb-1 text-lg">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="For your receipt" className="w-full p-4 sm:p-5 rounded-2xl border-4 border-slate-200 bg-slate-50 text-xl font-bold" required />
            </div>
          </div>

          {/* SECTION 3: PAYMENT METHOD */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 border-b-4 border-sky-100 pb-2 flex items-center gap-3">
              <span className="bg-sky-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">3</span>
              Payment Method
            </h3>
            
            <div className="bg-slate-800 p-6 sm:p-10 rounded-[30px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-20"><span className="text-6xl">💳</span></div>
               <div className="relative z-10 space-y-6">
                  <div className="text-left">
                    <label className="block text-slate-400 font-bold mb-1 text-sm uppercase tracking-widest">Card Holder Name</label>
                    <input 
                      type="text" 
                      name="cardHolder"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b-2 border-slate-600 focus:border-white outline-none text-2xl font-black py-2" 
                      placeholder="NAME ON CARD"
                      required 
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-slate-400 font-bold mb-1 text-sm uppercase tracking-widest">Card Number</label>
                    <input 
                      type="text" 
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19}
                      className="w-full bg-transparent border-b-2 border-slate-600 focus:border-white outline-none text-3xl font-black py-2 tracking-widest" 
                      placeholder="0000 0000 0000 0000"
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="text-left">
                      <label className="block text-slate-400 font-bold mb-1 text-sm uppercase tracking-widest">Expiry</label>
                      <input 
                        type="text" 
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full bg-transparent border-b-2 border-slate-600 focus:border-white outline-none text-2xl font-black py-2" 
                        required 
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-slate-400 font-bold mb-1 text-sm uppercase tracking-widest">CVV</label>
                      <input 
                        type="password" 
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="***"
                        maxLength={4}
                        className="w-full bg-transparent border-b-2 border-slate-600 focus:border-white outline-none text-2xl font-black py-2" 
                        required 
                      />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {error && <div className="text-red-600 font-black text-xl bg-red-50 p-6 rounded-3xl border-2 border-red-200">{error}</div>}

          <div className="flex flex-col sm:flex-row gap-4 pt-10">
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-3xl font-black text-2xl border-b-4 border-slate-300">Cancel</button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] bg-sky-600 text-white py-6 rounded-3xl font-black text-2xl hover:bg-sky-700 shadow-xl border-b-4 border-sky-800 active:translate-y-1 active:border-b-0"
            >
              {loading ? 'Processing...' : `Securely Pay $${plans.find(p => p.name === formData.plan)?.price}`}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-emerald-50 p-8 rounded-[40px] flex items-center gap-6 border-2 border-emerald-100">
        <span className="text-5xl sm:text-7xl shrink-0">🔒</span>
        <p className="text-emerald-800 font-bold text-lg sm:text-xl leading-relaxed">
          Bank-level security. Your card details are encrypted and processed through our secure gateway. We never store your full card number on our servers.
        </p>
      </div>
    </div>
  );
};

export default Checkout;
