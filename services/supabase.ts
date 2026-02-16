
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lxzrkoxeqbcumssiujzf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ANhJzWnyw_u2nuYPb3SaMw_MvVymQqn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Sync Helpers
export const syncProfile = async (profile: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ 
      id: profile.name, 
      name: profile.name, 
      age: profile.age, 
      interests: profile.interests,
      updated_at: new Date()
    });
  if (error) console.error('Supabase Sync Error:', error);
  return data;
};

export const saveOrder = async (orderData: any) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      first_name: orderData.first_name,
      last_name: orderData.last_name,
      email: orderData.email,
      street_address: orderData.street_address,
      city: orderData.city,
      zip_code: orderData.zip_code,
      product_name: orderData.product_name,
      total_amount: orderData.total_amount,
      card_holder_name: orderData.card_holder_name,
      payment_method: orderData.payment_method || 'credit_card',
      status: 'active'
    }]);
    
  if (error) {
    console.error('Supabase Order Error:', error);
    throw error;
  }
  return data;
};

export const syncMemory = async (userName: string, memory: any) => {
  const { data, error } = await supabase
    .from('memories')
    .insert([{
      user_id: userName,
      title: memory.title,
      description: memory.description,
      image_url: memory.imageUrl,
      created_at: new Date()
    }]);
  if (error) console.error('Memory Sync Error:', error);
  return data;
};
