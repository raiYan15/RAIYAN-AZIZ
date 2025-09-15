import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ServiceType, ServiceProvider, Booking, Message, MonthlyAnalytics, HourlyAnalytics, BookingStatus, ConversationMessage, Theme } from './types';
import { Icons, SERVICE_TYPE_CONFIG, MOCK_DISTRICTS, DEFAULT_THEME } from './constants';

type View = 'Dashboard' | 'Bookings' | 'Messages' | 'Analytics' | 'Profile';

// --- DATA GENERATION UTILITY ---

const generateDynamicData = (serviceType: ServiceType, userData: Partial<ServiceProvider>) => {
    const data: {
        provider: ServiceProvider,
        bookings: Booking[],
        messages: Message[],
        conversation: ConversationMessage[],
        monthlyAnalytics: MonthlyAnalytics[],
        hourlyAnalytics: HourlyAnalytics[]
    } = {
        provider: {} as ServiceProvider,
        bookings: [],
        messages: [],
        conversation: [],
        monthlyAnalytics: [],
        hourlyAnalytics: []
    };

    const touristNames = ['Rohan Verma', 'Priya Singh', 'Amit Kumar', 'Sneha Patil', 'Vikas Reddy', 'Aarav Gupta', 'Emily Carter', 'Anika Sharma', 'Raj Patel'];
    const ownerNames = {
        [ServiceType.SHOP]: 'Anjali Sharma',
        [ServiceType.RESTAURANT]: 'Vikram Rathore',
        [ServiceType.HOMESTAY]: 'Meena Kumari',
        [ServiceType.GUIDE]: 'Sanjay Murmu',
        [ServiceType.TRANSPORT]: 'Rajesh Yadav',
        [ServiceType.OTHER]: 'Pooja Devi'
    };
    const businessNames = {
        [ServiceType.SHOP]: 'Jharkhand Crafts',
        [ServiceType.RESTAURANT]: 'Tribal Tastes',
        [ServiceType.HOMESTAY]: 'Forest Canopy Homestay',
        [ServiceType.GUIDE]: 'Wild Jharkhand Tours',
        [ServiceType.TRANSPORT]: 'Ranchi City Cabs',
        [ServiceType.OTHER]: 'Local Experiences'
    };
    const descriptions = {
        [ServiceType.SHOP]: 'Authentic tribal handicrafts and souvenirs from the heart of Jharkhand.',
        [ServiceType.RESTAURANT]: 'Experience the unique flavors of Jharkhandi cuisine in a traditional setting.',
        [ServiceType.HOMESTAY]: 'A peaceful retreat nestled in nature, offering a comfortable and authentic stay.',
        [ServiceType.GUIDE]: 'Certified local guide offering personalized tours of waterfalls, temples, and wildlife.',
        [ServiceType.TRANSPORT]: 'Reliable and safe transportation services for tourists across the state.',
        [ServiceType.OTHER]: 'Curated local experiences, from pottery workshops to village tours.'
    };
    const bookingNotes = {
        [ServiceType.SHOP]: ['Wants to see the latest dokra collection.', 'Looking for paitkar paintings.', 'Inquiring about bulk purchase.'],
        [ServiceType.RESTAURANT]: ['Table for 4, anniversary celebration.', 'Requesting a window seat.', 'Needs gluten-free options.'],
        [ServiceType.HOMESTAY]: ['Family of 4, need an extra bed.', 'Late check-in around 10 PM.', 'Wants to book a bonfire session.'],
        [ServiceType.GUIDE]: ['Interested in a photography tour.', 'Wants a guide for the Betla National Park trip.', 'Family with young children.'],
        [ServiceType.TRANSPORT]: ['Airport pickup for 2 people with luggage.', 'Full day cab required for local sightseeing.', 'Need a 7-seater for a family trip.'],
        [ServiceType.OTHER]: ['Booking for the pottery workshop.', 'Wants to schedule a village tour.', 'Inquiring about the cooking class.']
    };
    const messageContent = {
        [ServiceType.SHOP]: ['Do you ship internationally?', 'Is this item handmade?', 'Thank you for the beautiful souvenir!'],
        [ServiceType.RESTAURANT]: ['Is parking available?', 'Do you take reservations for large groups?', 'The food was amazing!'],
        [ServiceType.HOMESTAY]: ['Is the homestay pet friendly?', 'What are the meal options?', 'Thanks for the wonderful stay.'],
        [ServiceType.GUIDE]: ['What is the duration of the tour?', 'Are entry fees included?', 'You were a great guide!'],
        [ServiceType.TRANSPORT]: ['Can you provide an infant car seat?', 'Is the fare inclusive of tolls?', 'The driver was very professional.'],
        [ServiceType.OTHER]: ['What should I bring for the workshop?', 'Is the tour physically demanding?', 'We had a fantastic time!']
    };

    const ownerNameFromEmail = (email: string) =>
      email.split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    const baseProvider: ServiceProvider = {
        id: `prov_${Math.random().toString(36).substr(2, 9)}`,
        businessName: businessNames[serviceType],
        serviceType: serviceType,
        ownerName: ownerNames[serviceType],
        email: `${ownerNames[serviceType].split(' ')[0].toLowerCase()}@example.com`,
        phone: '+91 98765 43210',
        address: '123 Main Road, Ranchi',
        pincode: '834001',
        shortDescription: descriptions[serviceType],
        workingHours: '10 AM - 8 PM',
        priceRange: '₹500 - ₹5000',
        profilePhotoUrl: `https://picsum.photos/seed/${ownerNames[serviceType]}/100/100`
    };

    const cleanUserData = Object.fromEntries(Object.entries(userData).filter(([_, v]) => v != null && v !== ''));
    data.provider = { ...baseProvider, ...cleanUserData };

    if (data.provider.email && cleanUserData.email && !cleanUserData.ownerName) {
         data.provider.ownerName = ownerNameFromEmail(data.provider.email);
    }
    
    data.provider.profilePhotoUrl = `https://picsum.photos/seed/${data.provider.ownerName.replace(' ','')}/100/100`;
    
    const seed = (data.provider.ownerName || 'DefaultUser').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    let currentSeed = seed;
    const seededRandom = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    };

    const statuses = Object.values(BookingStatus);
    for (let i = 0; i < 7; i++) {
        const name = touristNames[Math.floor(seededRandom() * touristNames.length)];
        data.bookings.push({
            id: `book_${i}_${seed}`,
            touristName: name,
            touristAvatar: `https://picsum.photos/seed/${name.replace(' ', '')}/40/40`,
            date: `2024-07-${22 + i}`,
            time: `${Math.floor(seededRandom() * 12) + 1}:${String(Math.floor(seededRandom() * 60)).padStart(2, '0')} ${seededRandom() > 0.5 ? 'AM' : 'PM'}`,
            status: statuses[Math.floor(seededRandom() * statuses.length)],
            notes: seededRandom() > 0.4 ? bookingNotes[serviceType][Math.floor(seededRandom() * bookingNotes[serviceType].length)] : undefined
        });
    }

    for (let i = 0; i < 4; i++) {
        const name = touristNames[Math.floor(seededRandom() * touristNames.length)];
        data.messages.push({
            id: `msg_${i}_${seed}`,
            touristName: name,
            touristAvatar: `https://picsum.photos/seed/${name.replace(' ', '')}/40/40`,
            lastMessage: messageContent[serviceType][Math.floor(seededRandom() * messageContent[serviceType].length)],
            timestamp: i === 0 ? '11:30 AM' : 'Yesterday',
            unreadCount: i === 1 ? Math.floor(seededRandom() * 3) + 1 : 0
        });
    }
    
    const firstTourist = data.messages[1].touristName;
    const firstTouristAvatar = data.messages[1].touristAvatar;
    data.conversation = [
        { id: 'conv_1', sender: 'tourist', text: `Hi there! I was wondering: ${messageContent[serviceType][Math.floor(seededRandom() * messageContent[serviceType].length)]}`, timestamp: '9:10 AM' },
        { id: 'conv_2', sender: 'provider', text: 'Hello! Thanks for your question. Yes, we do.', timestamp: '9:11 AM' },
        { id: 'conv_3', sender: 'tourist', text: `That's great to hear. Thanks!`, timestamp: '9:12 AM' }
    ];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const revenueMultiplier = Object.values(ServiceType).indexOf(serviceType) + 1.5;
    months.forEach((month, i) => {
        data.monthlyAnalytics.push({
            month: month,
            visitors: 120 + i * 20 + Math.floor(seededRandom() * 30),
            revenue: (35000 + i * 5000 + Math.floor(seededRandom() * 10000)) * (revenueMultiplier * 0.4)
        });
    });
    for (let i = 9; i <= 18; i++) {
        data.hourlyAnalytics.push({
            hour: `${i > 12 ? i - 12 : i}${i >= 12 ? 'PM' : 'AM'}`,
            bookings: Math.floor(seededRandom() * 10 + 3) + (i > 11 && i < 15 ? 5 : 0)
        });
    }

    return { ...data, firstTourist, firstTouristAvatar };
};

const ThemeContext = createContext<Theme | null>(null);
const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};

// --- HELPER & UI COMPONENTS (Dashboard) ---

const Sidebar: React.FC<{
    currentView: View;
    setView: (view: View) => void;
    serviceProvider: ServiceProvider;
    onLogout: () => void;
    isSidebarOpen: boolean;
}> = ({ currentView, setView, serviceProvider, onLogout, isSidebarOpen }) => {
    const theme = useTheme();
    const navItems: { view: View; icon: JSX.Element; }[] = [
        { view: 'Dashboard', icon: Icons.Dashboard },
        { view: 'Bookings', icon: Icons.Bookings },
        { view: 'Messages', icon: Icons.Messages },
        { view: 'Analytics', icon: Icons.Analytics },
        { view: 'Profile', icon: Icons.Profile },
    ];

    const baseItemClass = `flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg transform hover:scale-105`;
    const activeItemClass = `bg-${theme.primary}-600 ${theme.textOnPrimary} shadow-lg`;
    const inactiveItemClass = `text-gray-200 hover:bg-${theme.primary}-700 hover:text-white`;

    return (
        <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col justify-between w-64 p-4 text-white transition-transform duration-300 ease-in-out transform bg-gray-900/80 backdrop-blur-md border-r border-white/10 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div>
                <div className="flex items-center p-2 mb-6 space-x-3 border-b border-gray-700 pb-4">
                    <span className={`p-2 rounded-full bg-${theme.primary}-500`}>{theme.icon}</span>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">{serviceProvider.businessName}</h1>
                        <p className="text-xs text-gray-400">{serviceProvider.serviceType}</p>
                    </div>
                </div>
                <nav className="space-y-2">
                    {navItems.map(item => (
                        <button key={item.view} onClick={() => setView(item.view)} className={`${baseItemClass} ${currentView === item.view ? activeItemClass : inactiveItemClass}`}>
                            {item.icon}
                            <span className="ml-3">{item.view}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <button onClick={onLogout} className={`${baseItemClass} ${inactiveItemClass}`}>
                {Icons.Logout}
                <span className="ml-3">Logout</span>
            </button>
        </aside>
    );
};

const Header: React.FC<{ title: string; profilePhotoUrl: string; onMenuClick: () => void }> = ({ title, profilePhotoUrl, onMenuClick }) => {
    const theme = useTheme();
    return (
        <header className={`flex items-center justify-between p-4 bg-white/75 border-b border-${theme.primary}-200/50 backdrop-blur-md dark:bg-gray-800/75 dark:border-${theme.primary}-700/50`}>
            <button onClick={onMenuClick} className="p-2 text-gray-500 rounded-md md:hidden hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
            <div>
                <img src={profilePhotoUrl} alt="Profile" className={`w-10 h-10 rounded-full ring-2 ring-offset-2 ring-${theme.primary}-400`} />
            </div>
        </header>
    );
};

const DashboardCard: React.FC<{ title: string; value: string; icon: JSX.Element; change?: string; }> = ({ title, value, icon, change }) => {
    const theme = useTheme();
    const isPositive = change && change.startsWith('+');
    
    return (
        <div className={`p-6 bg-white/90 rounded-lg shadow-lg backdrop-blur-md dark:bg-gray-800/90 border-t-4 border-${theme.primary}-400 transition-all duration-300 hover:shadow-2xl hover:scale-105`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
                </div>
                <div className={`p-3 text-white bg-${theme.primary}-500 rounded-full`}>
                    {icon}
                </div>
            </div>
            {change && (
                <p className={`mt-2 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {change} since yesterday
                </p>
            )}
        </div>
    );
};

// --- AUTHENTICATION COMPONENTS ---

const AuthInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, id: string, themeColor?: string }> = ({ label, id, type, themeColor = 'green', ...props }) => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative mt-1">
                <input
                    id={id}
                    type={isPassword ? (isPasswordVisible ? 'text' : 'password') : type}
                    {...props}
                    className={`block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-${themeColor}-500 focus:border-${themeColor}-500 sm:text-sm`}
                />
                {isPassword && (
                    <button type="button" onClick={() => setPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {isPasswordVisible ? Icons.EyeOff : Icons.Eye}
                    </button>
                )}
            </div>
        </div>
    );
};

const LoginForm: React.FC<{ onLogin: (type: ServiceType, userData: Partial<ServiceProvider>) => void }> = ({ onLogin }) => {
    const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.SHOP);
    const [email, setEmail] = useState('');
    
    const theme = SERVICE_TYPE_CONFIG[serviceType] || DEFAULT_THEME;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(serviceType, { email });
    };

    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-800">Welcome back</h3>
            <p className="text-sm text-gray-500 mt-1">Sign in to access your vendor dashboard</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                    <label htmlFor="businessTypeLogin" className="block text-sm font-medium text-gray-700">Business Type</label>
                    <select 
                        id="businessTypeLogin"
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value as ServiceType)}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border border-gray-300 focus:outline-none focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500 sm:text-sm rounded-md`}
                    >
                        {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <AuthInput label="Email or Phone" id="email" type="email" placeholder="Enter your email or phone number" required value={email} onChange={(e) => setEmail(e.target.value)} themeColor={theme.primary}/>
                <AuthInput label="Password" id="password" type="password" placeholder="Enter your password" required themeColor={theme.primary} />
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className={`h-4 w-4 text-${theme.primary}-600 focus:ring-${theme.primary}-500 border-gray-300 rounded`} />
                        <label htmlFor="remember-me" className="ml-2 block text-gray-900">Remember me</label>
                    </div>
                    <a href="#" className={`font-medium text-${theme.primary}-600 hover:text-${theme.primary}-500`}>Forgot password?</a>
                </div>
                <button type="submit" className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${theme.textOnPrimary} bg-${theme.primary}-600 hover:bg-${theme.primary}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primary}-500`}>
                    Sign In
                </button>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">OR CONTINUE WITH</span></div>
                </div>
                <button type="button" className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {Icons.Google}<span className="ml-2">Continue with Google</span>
                </button>
            </form>
        </div>
    );
};

const SignUpForm: React.FC<{ onSignUp: (type: ServiceType, userData: Partial<ServiceProvider>) => void }> = ({ onSignUp }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<ServiceProvider> & { confirmPassword?: string }>({
        serviceType: ServiceType.SHOP,
        shortDescription: '',
    });
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const theme = SERVICE_TYPE_CONFIG[formData.serviceType!] || DEFAULT_THEME;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
            setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
        }
    };
    
    const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileChange(e.dataTransfer.files);
    };

    const nextStep = () => setStep(s => (s < 3 ? s + 1 : s));
    const prevStep = () => setStep(s => (s > 1 ? s - 1 : s));
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) nextStep();
        else onSignUp(formData.serviceType!, formData);
    };

    return (
        <div className="animate-fade-in">
             <h3 className="text-xl font-semibold text-gray-800">Join our network</h3>
             <p className="text-sm text-gray-500 mt-1">Create your vendor account in just 3 steps</p>
            <div className="my-6">
                <div className="flex items-center">
                    {[1, 2, 3].map((s, i) => (
                        <React.Fragment key={s}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= s ? `bg-${theme.primary}-600 text-white` : 'bg-gray-200 text-gray-500'}`}>
                                    {step > s ? '✓' : s}
                                </div>
                            </div>
                            {i < 2 && <div className={`flex-auto border-t-2 transition-colors ${step > s ? `border-${theme.primary}-600` : 'border-gray-200'}`}></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 && (
                    <div className="space-y-4 animate-fade-in-fast">
                        <h4 className="font-semibold text-gray-600">Step 1: Account Information</h4>
                        <AuthInput label="Full Name" id="ownerName" type="text" placeholder="Enter your full name" required onChange={handleChange} themeColor={theme.primary} />
                        <AuthInput label="Email" id="email" type="email" placeholder="your@email.com" required onChange={handleChange} themeColor={theme.primary} />
                        <AuthInput label="Phone Number" id="phone" type="tel" placeholder="+91" required onChange={handleChange} themeColor={theme.primary} />
                        <AuthInput label="Password" id="password" type="password" placeholder="Create a strong password" required themeColor={theme.primary} />
                        <AuthInput label="Confirm Password" id="confirmPassword" type="password" placeholder="Confirm your password" required themeColor={theme.primary} />
                    </div>
                )}
                 {step === 2 && (
                    <div className="space-y-4 animate-fade-in-fast">
                        <h4 className="font-semibold text-gray-600">Step 2: Business Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                                <select id="serviceType" defaultValue={formData.serviceType} onChange={handleChange} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500 sm:text-sm rounded-md`}>
                                    {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <AuthInput label="Business Name" id="businessName" type="text" placeholder="Your business name" required onChange={handleChange} themeColor={theme.primary} />
                        </div>
                        <AuthInput label="Complete Address" id="address" type="text" placeholder="Full address including landmarks" required onChange={handleChange} themeColor={theme.primary} />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700">District</label>
                               <select className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500 sm:text-sm rounded-md`}>
                                   {MOCK_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                               </select>
                           </div>
                           <AuthInput label="PIN Code" id="pincode" type="text" placeholder="123456" required onChange={handleChange} themeColor={theme.primary} />
                        </div>
                        <div>
                            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">Short Description (Optional)</label>
                            <textarea id="shortDescription" rows={3} onChange={handleChange} maxLength={300} placeholder="Brief description of your services" className={`mt-1 shadow-sm focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500 block w-full sm:text-sm border border-gray-300 rounded-md`}></textarea>
                            <p className="text-right text-xs text-gray-500">{formData.shortDescription?.length || 0}/300</p>
                        </div>
                    </div>
                )}
                 {step === 3 && (
                     <div className="space-y-4 animate-fade-in-fast">
                        <h4 className="font-semibold text-gray-600">Step 3: Verification</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Verification Documents</label>
                            <p className="text-xs text-gray-500 mb-2">Upload business license, ID proof, or any other relevant documents.</p>
                             <div 
                                onDragOver={(e) => e.preventDefault()} 
                                onDrop={handleDragDrop} 
                                onClick={() => fileInputRef.current?.click()}
                                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-${theme.primary}-500`}
                            >
                                <div className="space-y-1 text-center">
                                    {Icons.Upload}
                                    <div className="flex text-sm text-gray-600">
                                        <p className="pl-1">Drag and drop files here, or <span className={`font-medium text-${theme.primary}-600`}>browse files</span></p>
                                    </div>
                                    <p className="text-xs text-gray-500">Supports images, PDF, DOC (max 5 files, 10MB each)</p>
                                </div>
                            </div>
                             <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} multiple className="hidden" />
                            <ul className="mt-2 text-sm text-gray-600">
                                {files.map((file, i) => <li key={i}>{file.name}</li>)}
                            </ul>
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input id="blockchain" name="blockchain" type="checkbox" className={`focus:ring-${theme.primary}-500 h-4 w-4 text-${theme.primary}-600 border-gray-300 rounded`} />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="blockchain" className="font-medium text-gray-700">Request Blockchain Verification</label>
                                <p className="text-gray-500 text-xs">Enhanced trust and credibility (optional, takes 2-3 business days)</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={prevStep} className={`py-2 px-4 rounded-md text-sm font-medium ${step === 1 ? 'invisible' : 'bg-gray-200 hover:bg-gray-300'}`}>Back</button>
                    <button type="submit" className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${theme.textOnPrimary} bg-${theme.primary}-600 hover:bg-${theme.primary}-700`}>
                        {step === 1 && 'Next: Business Information →'}
                        {step === 2 && 'Next: Verification →'}
                        {step === 3 && 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const AuthPage: React.FC<{ onLogin: (type: ServiceType, userData: Partial<ServiceProvider>) => void }> = ({ onLogin }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="min-h-screen bg-white flex font-sans">
            <div className="hidden lg:block w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop')" }}>
                <div className="bg-black bg-opacity-50 h-full p-12 text-white flex flex-col justify-between">
                    <div className="z-10">
                        <h1 className="text-4xl xl:text-5xl font-bold leading-tight">Join Jharkhand Tourism Network</h1>
                        <p className="mt-4 text-lg max-w-md">Connect with travelers exploring the pristine forests, waterfalls, and rich tribal culture of Jharkhand.</p>
                    </div>
                    <div className="space-y-6 z-10">
                        <div className="flex items-center">
                            {Icons.Leaf}
                            <div className="ml-4">
                                <h3 className="font-semibold">Eco-Tourism Focus</h3>
                                <p className="text-gray-300 text-sm">Sustainable tourism in pristine natural settings</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                           {Icons.Community}
                            <div className="ml-4">
                                <h3 className="font-semibold">Growing Community</h3>
                                <p className="text-gray-300 text-sm">Join 500+ verified vendors across Jharkhand</p>
                            </div>
                        </div>
                         <div className="flex items-center">
                           {Icons.Blockchain}
                            <div className="ml-4">
                                <h3 className="font-semibold">Blockchain Verified</h3>
                                <p className="text-gray-300 text-sm">Optional blockchain verification for trust</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-green-700">Jharkhand Tourism</h2>
                        <p className="text-gray-500">Vendor Portal - Connect with travelers exploring Jharkhand</p>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                        <button onClick={() => setIsLoginView(true)} className={`w-1/2 py-2 rounded-md font-semibold transition text-sm ${isLoginView ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}>Login</button>
                        <button onClick={() => setIsLoginView(false)} className={`w-1/2 py-2 rounded-md font-semibold transition text-sm ${!isLoginView ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}>Sign Up</button>
                    </div>
                    
                    {isLoginView ? <LoginForm onLogin={onLogin} /> : <SignUpForm onSignUp={onLogin} />}
                </div>
            </div>
        </div>
    );
};


// --- PAGE COMPONENTS (Dashboard) ---

const DashboardPage: React.FC = () => {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="New Inquiries" value="12" icon={Icons.Messages} change="+3" />
            <DashboardCard title="Pending Bookings" value="8" icon={Icons.Bookings} change="-1" />
            <DashboardCard title="Today's Revenue" value="₹8,500" icon={Icons.Analytics} change="+15%" />
            <DashboardCard title="Overall Rating" value="4.8/5" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.975-2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
        </div>
    );
};

const BookingsPage: React.FC<{ bookingsData: Booking[] }> = ({ bookingsData }) => {
    const theme = useTheme();
    const [filter, setFilter] = useState<BookingStatus | 'All'>('All');
    
    const filteredBookings = filter === 'All' ? bookingsData : bookingsData.filter(b => b.status === filter);

    const statusColors: { [key in BookingStatus]: string } = {
        [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [BookingStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        [BookingStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    return (
        <div className="bg-white/90 rounded-lg shadow-lg backdrop-blur-md dark:bg-gray-800/90">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex space-x-2">
                    {(['All', ...Object.values(BookingStatus)] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-300 ${filter === status ? `bg-${theme.primary}-600 ${theme.textOnPrimary} shadow` : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 dark:bg-gray-700/50 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tourist</th>
                            <th scope="col" className="px-6 py-3">Date & Time</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(booking => (
                            <tr key={booking.id} className={`border-b bg-transparent dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-600/20 transition-all duration-1000 ${booking.isNew ? `bg-${theme.primary}-100/50 dark:bg-${theme.primary}-900/40` : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <img className="w-10 h-10 rounded-full" src={booking.touristAvatar} alt={booking.touristName} />
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{booking.touristName}</div>
                                            {booking.notes && <div className="text-xs text-gray-500 dark:text-gray-400">{booking.notes}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{booking.date} at {booking.time}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                     <button className={`text-${theme.primary}-600 hover:text-${theme.primary}-900 dark:text-${theme.primary}-400 dark:hover:text-${theme.primary}-200`}>View</button>
                                     <button className={`text-${theme.primary}-600 hover:text-${theme.primary}-900 dark:text-${theme.primary}-400 dark:hover:text-${theme.primary}-200`}>Confirm</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MessagesPage: React.FC<{ messages: Message[], conversation: ConversationMessage[], activeTouristName: string, activeTouristAvatar: string }> = ({ messages, conversation, activeTouristName, activeTouristAvatar }) => {
    const theme = useTheme();
    return (
        <div className="flex h-[calc(100vh-120px)] bg-white/90 rounded-lg shadow-lg backdrop-blur-md dark:bg-gray-800/90 overflow-hidden">
            <div className="w-1/3 border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 font-bold">Conversations</div>
                <div className="overflow-y-auto">
                    {messages.map(msg => (
                        <div key={msg.id} className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-1000 ${msg.unreadCount > 0 && !msg.isNew ? `bg-${theme.primary}-100/30 dark:bg-${theme.primary}-900/20 border-l-4 border-${theme.primary}-500` : ''} ${msg.isNew ? `bg-${theme.primary}-100/50 dark:bg-${theme.primary}-900/40 border-l-4 border-${theme.primary}-500` : ''}`}>
                            <img src={msg.touristAvatar} alt={msg.touristName} className="w-12 h-12 rounded-full"/>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{msg.touristName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{msg.lastMessage}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">{msg.timestamp}</p>
                                {msg.unreadCount > 0 && <span className="flex items-center justify-center w-5 h-5 mt-1 text-xs font-bold text-white bg-red-500 rounded-full">{msg.unreadCount}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center space-x-3">
                    <img src={activeTouristAvatar} alt={activeTouristName} className="w-10 h-10 rounded-full"/>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{activeTouristName}</p>
                        <p className={`text-xs text-${theme.primary}-500`}>Online</p>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {conversation.map(c => (
                        <div key={c.id} className={`flex ${c.sender === 'provider' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${c.sender === 'provider' ? `bg-${theme.primary}-600 ${theme.textOnPrimary}` : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                <p>{c.text}</p>
                                <p className={`text-xs mt-1 text-right ${c.sender === 'provider' ? `text-${theme.primary}-200` : 'text-gray-500 dark:text-gray-400'}`}>{c.timestamp}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <input type="text" placeholder="Type your message..." className={`w-full px-4 py-2 bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 dark:bg-gray-700`}/>
                </div>
            </div>
        </div>
    );
};

const AnalyticsPage: React.FC<{ monthlyData: MonthlyAnalytics[], hourlyData: HourlyAnalytics[] }> = ({ monthlyData, hourlyData }) => {
    const theme = useTheme();

    const getHexColor = (colorName: string) => {
      const colors: Record<string, string> = { 'indigo': '#4f46e5', 'rose': '#f43f5e', 'emerald': '#10b981', 'amber': '#f59e0b', 'violet': '#8b5cf6', 'slate': '#64748b' };
      return colors[colorName] || '#6b7280';
    }
    
    return (
        <div className="space-y-6">
            <div className="p-6 bg-white/90 rounded-lg shadow-lg backdrop-blur-md dark:bg-gray-800/90">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Monthly Visitors & Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }}/>
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="visitors" stroke={getHexColor(theme.primary)} strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="p-6 bg-white/90 rounded-lg shadow-lg backdrop-blur-md dark:bg-gray-800/90">
                 <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Peak Booking Hours</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }}/>
                        <Legend />
                        <Bar dataKey="bookings" fill={getHexColor(theme.primary)} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const ProfilePage: React.FC<{ serviceProvider: ServiceProvider }> = ({ serviceProvider }) => {
    const theme = useTheme();
    return (
        <div className="p-6 bg-white/90 rounded-lg shadow-lg backdrop-blur-md dark:bg-gray-800/90">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Business Information</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your business details here.</p>
            <form className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                    <input type="text" defaultValue={serviceProvider.businessName} className={`block w-full mt-1 form-input rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500`}/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner Name</label>
                    <input type="text" defaultValue={serviceProvider.ownerName} className={`block w-full mt-1 form-input rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500`}/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" defaultValue={serviceProvider.email} className={`block w-full mt-1 form-input rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500`}/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input type="tel" defaultValue={serviceProvider.phone} className={`block w-full mt-1 form-input rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500`}/>
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    <input type="text" defaultValue={serviceProvider.address} className={`block w-full mt-1 form-input rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500`}/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PIN Code</label>
                    <input type="text" defaultValue={serviceProvider.pincode} className={`block w-full mt-1 form-input rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500`}/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Working Hours</label>
                    <input type="text" defaultValue={serviceProvider.workingHours} className={`block w-full mt-1 form-input rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500`}/>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
                    <textarea defaultValue={serviceProvider.shortDescription} rows={3} className={`block w-full mt-1 form-textarea rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500`}/>
                </div>
                <div className="flex justify-end md:col-span-2">
                    <button type="submit" className={`px-6 py-2 ${theme.textOnPrimary} bg-${theme.primary}-600 rounded-md hover:bg-${theme.primary}-700`}>Save Changes</button>
                </div>
            </form>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentView, setCurrentView] = useState<View>('Dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const [serviceProvider, setServiceProvider] = useState<ServiceProvider | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<ConversationMessage[]>([]);
    const [monthlyAnalytics, setMonthlyAnalytics] = useState<MonthlyAnalytics[]>([]);
    const [hourlyAnalytics, setHourlyAnalytics] = useState<HourlyAnalytics[]>([]);
    const [activeChat, setActiveChat] = useState({ name: '', avatar: '' });

    const handleLogin = (type: ServiceType, userData: Partial<ServiceProvider>) => {
        const serviceType = userData.serviceType || type;
        const dynamicData = generateDynamicData(serviceType, userData);
        setServiceProvider(dynamicData.provider);
        setBookings(dynamicData.bookings);
        setMessages(dynamicData.messages);
        setConversation(dynamicData.conversation);
        setMonthlyAnalytics(dynamicData.monthlyAnalytics);
        setHourlyAnalytics(dynamicData.hourlyAnalytics);
        setActiveChat({ name: dynamicData.firstTourist, avatar: dynamicData.firstTouristAvatar });
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setServiceProvider(null);
        setCurrentView('Dashboard');
    };

    useEffect(() => {
        if (!isLoggedIn || !serviceProvider) return;

        // --- REAL-TIME WEB SOCKET SIMULATION ---
        const seed = (serviceProvider.ownerName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let currentSeed = seed;
        const seededRandom = () => {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            return currentSeed / 233280;
        };
        const touristNames = ['Rohan Verma', 'Priya Singh', 'Amit Kumar', 'Sneha Patil', 'Vikas Reddy', 'Aarav Gupta'];
        const messageContentSnippets = ['Can you confirm the timing?', 'Is it possible to reschedule?', 'Just checking in about my booking.', 'Thank you!', 'Great, see you then.'];

        // 1. New Booking Simulation
        const newBookingInterval = setInterval(() => {
            const name = touristNames[Math.floor(seededRandom() * touristNames.length)];
            const newBooking: Booking = {
                id: `book_${Date.now()}`,
                touristName: name,
                touristAvatar: `https://picsum.photos/seed/${name.replace(' ', '')}/40/40`,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: BookingStatus.PENDING,
                isNew: true,
            };
            setBookings(prev => [newBooking, ...prev.slice(0, 19)]);
            setTimeout(() => setBookings(prev => prev.map(b => (b.id === newBooking.id ? { ...b, isNew: false } : b))), 2000);
        }, 18000);

        // 2. New Message Simulation
        const newMessageInterval = setInterval(() => {
            setMessages(prev => {
                if (prev.length === 0) return prev;
                const index = Math.floor(seededRandom() * prev.length);
                const updatedMsg = {
                    ...prev[index],
                    lastMessage: messageContentSnippets[Math.floor(seededRandom() * messageContentSnippets.length)],
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    unreadCount: (prev[index].unreadCount || 0) + 1,
                    isNew: true,
                };
                const newMessages = [updatedMsg, ...prev.filter((_, i) => i !== index)];
                setTimeout(() => setMessages(current => current.map(m => (m.id === updatedMsg.id ? { ...m, isNew: false } : m))), 2000);
                return newMessages;
            });
        }, 12000);

        // 3. Booking Status Update Simulation
        const bookingUpdateInterval = setInterval(() => {
            setBookings(prev => {
                const pending = prev.filter(b => b.status === BookingStatus.PENDING);
                if (pending.length === 0) return prev;
                const toUpdate = pending[Math.floor(seededRandom() * pending.length)];
                return prev.map(b => b.id === toUpdate.id ? { ...b, status: BookingStatus.CONFIRMED, isNew: true } : b);
            });
            setTimeout(() => setBookings(prev => prev.map(b => ({ ...b, isNew: false }))), 2000);
        }, 25000);

        return () => {
            clearInterval(newBookingInterval);
            clearInterval(newMessageInterval);
            clearInterval(bookingUpdateInterval);
        };
    }, [isLoggedIn, serviceProvider]);
    
    if (!isLoggedIn || !serviceProvider) {
        return <AuthPage onLogin={handleLogin} />;
    }
    
    const theme = SERVICE_TYPE_CONFIG[serviceProvider.serviceType] || DEFAULT_THEME;

    const pages: { [key in View]: React.ReactNode } = {
        Dashboard: <DashboardPage />,
        Bookings: <BookingsPage bookingsData={bookings} />,
        Messages: <MessagesPage messages={messages} conversation={conversation} activeTouristName={activeChat.name} activeTouristAvatar={activeChat.avatar} />,
        Analytics: <AnalyticsPage monthlyData={monthlyAnalytics} hourlyData={hourlyAnalytics} />,
        Profile: <ProfilePage serviceProvider={serviceProvider} />,
    };

    return (
        <ThemeContext.Provider value={theme}>
            <div 
                className="h-screen bg-cover bg-center transition-all duration-500" 
                style={{ backgroundImage: theme.backgroundUrl }}
            >
                <div className="flex h-full">
                    <Sidebar 
                        currentView={currentView}
                        setView={setCurrentView}
                        serviceProvider={serviceProvider}
                        onLogout={handleLogout}
                        isSidebarOpen={isSidebarOpen}
                    />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Header title={currentView} profilePhotoUrl={serviceProvider.profilePhotoUrl} onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                            <div key={currentView} className="animate-fade-in-fast">
                               {pages[currentView]}
                            </div>
                        </main>
                    </div>
                    {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"></div>}
                </div>
            </div>
        </ThemeContext.Provider>
    );
};

export default App;
