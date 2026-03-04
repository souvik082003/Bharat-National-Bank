import { useState, useEffect } from 'react';

export default function MessagePopup({ message, type = 'success', onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: 'bg-emerald-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
    };

    return (
        <div className={`fixed top-6 right-6 z-[9999] max-w-sm transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className={`${colors[type] || colors.info} px-5 py-3.5 rounded-xl shadow-2xl font-semibold text-sm flex items-center gap-3`}>
                <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span>{message}</span>
                <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-auto opacity-70 hover:opacity-100 transition-opacity text-lg leading-none">&times;</button>
            </div>
        </div>
    );
}
