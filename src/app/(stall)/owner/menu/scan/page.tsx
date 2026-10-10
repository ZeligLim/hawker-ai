'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Upload, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type ScannedDish = {
 name: string;
 price: number;
 category: string;
 isVegetarian: boolean;
 spiceLevel: number;
 description?: string;
 selected?: boolean;
};

export default function ScanMenuPage() {
 const router = useRouter();
 const fileInputRef = useRef<HTMLInputElement>(null);
 
 const [imagePreview, setImagePreview] = useState<string | null>(null);
 const [imageBase64, setImageBase64] = useState<string | null>(null);
 const [isScanning, setIsScanning] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [error, setError] = useState('');
 const [scannedDishes, setScannedDishes] = useState<ScannedDish[]>([]);
 const [hasScanned, setHasScanned] = useState(false);

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setError('');
 const reader = new FileReader();
 reader.onload = (event) => {
 const result = event.target?.result as string;
 setImagePreview(result);
 setImageBase64(result);
 setHasScanned(false);
 setScannedDishes([]);
 };
 reader.onerror = () => {
 setError('Failed to read the image file. Please try again.');
 };
 reader.readAsDataURL(file);
 };

 const scanMenu = async () => {
 if (!imageBase64) return;
 
 setIsScanning(true);
 setError('');
 
 try {
 const response = await fetch('/api/owner/menu/scan', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ imageBase64 })
 });
 
 if (!response.ok) {
 const data = await response.json().catch(() => ({}));
 throw new Error(data.error || 'Failed to scan menu');
 }
 
 const data = await response.json();
 const dishes = data.dishes || [];
 
 if (dishes.length === 0) {
 setError('No dishes could be found in this image. Try a clearer photo.');
 } else {
 setScannedDishes(dishes.map((d: any) => ({ ...d, selected: true })));
 }
 setHasScanned(true);
 } catch (err: any) {
 setError(err.message || 'An error occurred during scanning.');
 } finally {
 setIsScanning(false);
 }
 };

 const toggleDishSelection = (index: number) => {
 setScannedDishes(prev => prev.map((dish, i) => i === index ? { ...dish, selected: !dish.selected } : dish));
 };

 const saveSelectedDishes = async () => {
 const selectedDishes = scannedDishes.filter(d => d.selected);
 if (selectedDishes.length === 0) {
 setError('Please select at least one dish to save.');
 return;
 }

 setIsSaving(true);
 setError('');

 try {
 const session = await supabase?.auth.getSession();
 const token = session?.data.session?.access_token;
 
 if (!token) {
 throw new Error('You must be signed in to save dishes.');
 }

 // We need to know which outlet to save to. We can get it from /api/owner/shops
 const shopsRes = await fetch('/api/owner/shops', {
 headers: { Authorization: `Bearer ${token}` }
 });
 
 if (!shopsRes.ok) throw new Error('Failed to fetch your shop details.');
 
 const shopsData = await shopsRes.json();
 const outletId = shopsData.shops?.[0]?.id; // Just use the first shop/outlet for now
 
 if (!outletId) throw new Error('No shop found for your account.');

 // Save each dish sequentially
 for (const dish of selectedDishes) {
 const dishPayload = {
 food_outlet_id: outletId,
 name: dish.name,
 category: dish.category,
 price: dish.price,
 is_available: true,
 is_vegetarian: dish.isVegetarian,
 spice_level: dish.spiceLevel,
 description: dish.description || ''
 };

 const saveRes = await fetch('/api/owner/dishes', {
 method: 'POST',
 headers: { 
 Authorization: `Bearer ${token}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify(dishPayload)
 });

 if (!saveRes.ok) {
 console.error(`Failed to save ${dish.name}`);
 }
 }

 // Navigate back to menu
 router.push('/owner/menu');
 router.refresh();
 } catch (err: any) {
 setError(err.message || 'Failed to save dishes.');
 setIsSaving(false);
 }
 };

 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f] sm:px-6">
 <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl">
 <header className="mb-6 flex items-center gap-3">
 <Link
 href="/owner/menu"
 className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs hover:bg-neutral-100 "
 >
 <ArrowLeft className="h-5 w-5 text-black" />
 </Link>
 <div>
 <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Scan Menu</h1>
 <p className="text-xs text-[#6e6e73]">Upload a photo of your physical menu</p>
 </div>
 </header>

 {error && (
 <div className="mb-6 rounded-[18px] ] bg-[#fff1f2] p-4 text-sm text-[#9f1239]">
 {error}
 </div>
 )}

 {!hasScanned ? (
 <div className="space-y-6">
 <div 
 onClick={() => fileInputRef.current?.click()}
 className="relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[26px] bg-white hover:bg-neutral-50 "
 >
 {imagePreview ? (
 <img src={imagePreview} alt="Menu preview" className="h-full w-full object-cover" />
 ) : (
 <div className="flex flex-col items-center p-6 text-center">
 <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-black">
 <Camera className="h-8 w-8" />
 </div>
 <h3 className="text-lg font-bold text-black">Tap to take a photo</h3>
 <p className="mt-2 text-sm text-neutral-500">Or upload an existing image from your gallery</p>
 </div>
 )}
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileChange}
 accept="image/*"
 capture="environment"
 className="hidden"
 />
 </div>

 {imagePreview && (
 <button
 type="button"
 onClick={scanMenu}
 disabled={isScanning}
 className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-bold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50 "
 >
 {isScanning ? (
 <>
 <Loader2 className="h-5 w-5 " />
 Scanning...
 </>
 ) : (
 <>
 <Upload className="h-5 w-5" />
 Extract Dishes
 </>
 )}
 </button>
 )}
 </div>
 ) : (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-bold text-black">Dishes Found ({scannedDishes.length})</h2>
 <button
 type="button"
 onClick={() => {
 setHasScanned(false);
 setScannedDishes([]);
 }}
 className="text-sm font-semibold text-black hover:underline"
 >
 Retake Photo
 </button>
 </div>

 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 {scannedDishes.map((dish, idx) => (
 <div 
 key={idx} 
 onClick={() => toggleDishSelection(idx)}
 className={`flex cursor-pointer items-start gap-3 rounded-[22px] bg-white p-4 shadow-sm ${
 dish.selected ? '' : ' hover:'
 }`}
 >
 <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
 dish.selected ? ' bg-black text-white' : ' bg-transparent'
 }`}>
 {dish.selected && <Check className="h-3 w-3" strokeWidth={3} />}
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-start justify-between gap-2">
 <h3 className="font-bold text-black truncate">{dish.name}</h3>
 <span className="font-semibold text-black shrink-0">RM {dish.price.toFixed(2)}</span>
 </div>
 <p className="mt-1 text-xs font-medium text-neutral-500">
 {dish.category} 
 {dish.isVegetarian && ' · Veg'} 
 {dish.spiceLevel > 0 && ` · Spiciness: ${dish.spiceLevel}/5`}
 </p>
 {dish.description && (
 <p className="mt-1 text-xs text-neutral-400 line-clamp-2">{dish.description}</p>
 )}
 </div>
 </div>
 ))}
 </div>

 <div className="pt-4">
 <button
 type="button"
 onClick={saveSelectedDishes}
 disabled={isSaving || scannedDishes.filter(d => d.selected).length === 0}
 className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-bold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50 "
 >
 {isSaving ? (
 <>
 <Loader2 className="h-5 w-5 " />
 Saving...
 </>
 ) : (
 'Save Selected to Menu'
 )}
 </button>
 </div>
 </div>
 )}
 </div>
 </main>
 );
}
