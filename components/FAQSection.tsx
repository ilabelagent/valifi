import React, { useState, forwardRef } from 'react';
import { PlusIcon, MinusIcon } from './icons';

const faqData = [
    {
        question: "How secure is my investment with Valifi?",
        answer: "Valifi uses the latest encryption technologies to protect your data. We adhere to stringent AML and KYC regulations, ensuring the highest level of security for your investments. Our platform integrates blockchain technologies, such as BTC, BNB, and USDT, to ensure secure, low-fee, and fast transactions."
    },
    {
        question: "How do I withdraw my profits from Valifi?",
        answer: "Withdrawals are simple. Log in, navigate to the withdrawal section, select the method (crypto or bank), enter the amount, and confirm the transaction. Your funds will be sent to the wallet or account you’ve selected."
    },
    {
        question: "What are the fees associated with Valifi's services?",
        answer: "Valifi operates without any hidden fees. While the platform does not charge fees for core services, there may be small transaction fees depending on your withdrawal method (crypto transactions and bank fees may apply). You’ll always know about any charges upfront."
    },
    {
        question: "How do I calculate my investment returns on Valifi?",
        answer: "Valifi uses a transparent and easy-to-understand ROI calculator. Simply select the Spectrum Plan, input your investment amount, and the system will automatically calculate expected returns based on our models and current market conditions."
    },
    {
        question: "What investment sectors does Valifi focus on?",
        answer: "Valifi provides diversified investments across cryptocurrency, stocks, real estate, forex, mineral resources, and POS mining. We combine multiple asset classes to reduce risk and maximize returns for our users."
    }
];

const FAQItem: React.FC<{
    item: { question: string; answer: string };
    isOpen: boolean;
    onClick: () => void;
}> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-slate-800">
            <button
                className="flex justify-between items-center w-full py-6 text-left"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                <div className="flex-shrink-0 ml-4">
                    {isOpen ? <MinusIcon className="w-6 h-6 text-sky-400" /> : <PlusIcon className="w-6 h-6 text-slate-400" />}
                </div>
            </button>
            <div
                className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <p className="text-slate-300 pb-6 pr-10">
                        {item.answer}
                    </p>
                </div>
            </div>
        </div>
    );
};


const FAQSection = forwardRef<HTMLDivElement, {}>((props, ref) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section ref={ref} id="faq" className="py-20 sm:py-32">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-slate-400">
                        Have questions? We've got answers. Here are some of the most common questions we get.
                    </p>
                </div>
                <div className="mt-16 max-w-4xl mx-auto">
                    {faqData.map((item, index) => (
                        <FAQItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
});
FAQSection.displayName = 'FAQSection';

export default FAQSection;