'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { Camera, Upload, MapPin, Clock, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { addDocument, COLLECTIONS } from '@/lib/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage as getStorage } from '@/lib/firebase';

export default function WorkPhotoPage() {
    const { user } = useAuth();
    const [photo, setPhoto] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            const reader = new FileReader();
            reader.onload = () => setPhoto(reader.result as string);
            reader.readAsDataURL(f);

            // Get GPS
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => console.log('GPS not available')
                );
            }
        }
    };

    const handleUpload = async () => {
        if (!user || !file) return;
        setUploading(true);

        try {
            const timestamp = Date.now();
            const storageRef = ref(getStorage(), `work-photos/${user.uid}/${timestamp}_${file.name}`);
            await uploadBytes(storageRef, file);
            const photoUrl = await getDownloadURL(storageRef);

            await addDocument(COLLECTIONS.DAILY_WORK_PHOTOS, {
                labourId: user.uid,
                photoUrl,
                description,
                gps: location ? { latitude: location.lat, longitude: location.lng } : { latitude: 0, longitude: 0 },
                timestamp,
            });

            setUploaded(true);
        } catch (error) {
            console.error('Error uploading photo:', error);
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setPhoto(null);
        setFile(null);
        setDescription('');
        setUploaded(false);
        setLocation(null);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">📸 Work Photo</h1>
            </div>

            {uploaded ? (
                <div className="text-center py-16 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-success" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Photo Uploaded!</h2>
                    <p className="text-secondary text-sm mb-6">Your daily work photo has been saved</p>
                    <button className="btn-primary" onClick={reset}>
                        Upload Another
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {/* Photo Capture */}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCapture}
                        className="hidden"
                    />

                    {photo ? (
                        <div className="mb-6">
                            <div className="relative rounded-2xl overflow-hidden">
                                <img src={photo} alt="Work photo" className="w-full h-64 object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <div className="flex items-center gap-4 text-white text-xs">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            <span>{new Date().toLocaleString('en-IN')}</span>
                                        </div>
                                        {location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="btn-secondary w-full mt-3"
                                onClick={() => fileRef.current?.click()}
                            >
                                Retake Photo
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="w-full h-64 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 hover:border-accent/30 transition-colors mb-6"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                                <Camera size={28} className="text-accent" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Take Work Photo</p>
                                <p className="text-muted text-sm mt-1">Auto GPS & timestamp captured</p>
                            </div>
                        </button>
                    )}

                    {/* Description */}
                    <div className="mb-6">
                        <label className="input-label">Work Description</label>
                        <textarea
                            className="input-field !min-h-[100px] resize-none"
                            placeholder="What work did you do today?"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Upload */}
                    <button
                        className="btn-primary w-full py-4"
                        onClick={handleUpload}
                        disabled={!photo || uploading}
                    >
                        {uploading ? (
                            <><Loader2 className="animate-spin" size={20} /> Uploading...</>
                        ) : (
                            <><Upload size={18} /> Upload Photo</>
                        )}
                    </button>
                </div>
            )}

            <BottomNav role="labour" />
        </div>
    );
}
