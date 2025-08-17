import React from 'react';
import { CodeIcon, DocumentIcon, ApiIcon, SparklesIcon } from './icons';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

const Section: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary mb-4 pb-2 border-b border-border">{title}</h2>
        <div className="prose prose-sm max-w-none space-y-4 text-card-foreground/90">
            {children}
        </div>
    </div>
);

const SubSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
        <div className="space-y-3 pl-4 border-l-2 border-primary/20">
            {children}
        </div>
    </div>
);

const CodeBlock: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <pre className="bg-secondary p-4 rounded-lg text-sm text-secondary-foreground overflow-x-auto">
        <code>
            {children}
        </code>
    </pre>
);

const APIGuideView: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 view-container">
            <Card className="p-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center bg-primary/10 p-4 rounded-full border border-primary/20 mb-4">
                        <CodeIcon className="w-12 h-12 text-primary"/>
                    </div>
                    <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">The Frontend Engineer's Guide to AI-Powered Backend Development</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">Seamlessly connect your detailed frontend design to a robust backend by leveraging the power of Google AI Studio and the Gemini API. This guide will walk you through the process of "vibe coding"—translating your frontend's needs into functional backend logic with unparalleled speed and efficiency.</p>
                </div>

                <Section title="The Core Concept: From Prompt to Production">
                    <p>The fundamental approach involves providing a detailed "prompt" to the Gemini model that describes your frontend's requirements. The model then generates the necessary backend code, which you can refine and integrate into your project. This allows you to rapidly prototype and build the logic that powers your user interface.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-secondary p-4 rounded-lg"><DocumentIcon className="w-8 h-8 mx-auto text-primary mb-2"/> <h4 className="font-semibold">1. Write a Prompt</h4><p className="text-xs">Describe your UI and its data needs.</p></div>
                        <div className="bg-secondary p-4 rounded-lg"><SparklesIcon className="w-8 h-8 mx-auto text-primary mb-2"/> <h4 className="font-semibold">2. Generate Code</h4><p className="text-xs">Let Gemini write the backend logic in Node.js.</p></div>
                        <div className="bg-secondary p-4 rounded-lg"><ApiIcon className="w-8 h-8 mx-auto text-primary mb-2"/> <h4 className="font-semibold">3. Integrate API</h4><p className="text-xs">Wire up your new backend endpoints to your UI.</p></div>
                    </div>
                </Section>
                
                <Section title="Getting Started with Google AI Studio">
                    <p>Google AI Studio is a web-based tool that provides a fast track to building with the Gemini family of models. It's the perfect environment for rapid prototyping and prompt experimentation. When you have a result you're satisfied with, you can select "Get code" in your preferred programming language to use the Gemini API.</p>
                </Section>

                <Section title="Crafting Your Valifi Backend: A Step-by-Step Guide">
                    <p>Here's a structured approach to generating backend logic for your detailed frontend components, using the Valifi platform as an example.</p>
                    <SubSection title="1. Formulate a Detailed Prompt">
                        <p>The quality of your generated code is directly proportional to the detail in your prompt. Your prompt must act as a comprehensive specification. For Valifi, we have several key documents that serve as our "source of truth":</p>
                        <ul className="list-disc pl-5 space-y-2">
                           <li><strong className="text-primary">`api.md`</strong>: Defines the exact endpoints, methods, and data structures.</li>
                           <li><strong className="text-primary">`data-models.md`</strong>: Describes the database schema and relationships.</li>
                           <li><strong className="text-primary">`business-logic.md`</strong>: Outlines the core rules and processes.</li>
                        </ul>
                        <p>By combining information from these files with a description of your UI component, you can create a highly effective prompt.</p>
                        
                        <h4 className="font-semibold text-foreground mt-4">Example Prompt: Creating the `POST /loans/apply` Endpoint</h4>
                        <p>Imagine you've just built the UI for the "Apply for Loan" feature in `LoansView.tsx`. Now, you need the backend logic.</p>
                        <CodeBlock>{`You are a senior backend engineer building the Valifi platform with Node.js, Express, and a mock in-memory data store.

Your task is to create the Express controller and route for a new feature: applying for a loan.

**Context from project documents:**

1.  **API Spec (api.md):**
    -   Endpoint: \`POST /loans/apply\`
    -   Authentication: JWT required.
    -   Request Body: \`{ "amount": 100000, "term": 180, "collateralAssetId": "...", "reason": "..." }\`
    -   Response (202 Accepted): The newly created LoanApplication object with \`status: 'Pending'\`.

2.  **Business Logic (business-logic.md):**
    -   Perform an eligibility check: User's KYC status must be 'Approved', they must have active investments, and their portfolio value must be >= $100,000.
    -   The requested loan amount cannot exceed 50% of their total portfolio value.
    -   On successful submission, create a new \`LoanApplication\` record with status 'Pending' and add it to the user's list of loans.

3.  **Data Model (types.ts):**
    -   The \`LoanApplication\` object has fields: \`id, date, amount, term, interestRate, collateralAssetId, reason, status\`.

**Instructions:**
Write the Express controller function named \`applyForLoan\` and the corresponding route definition. The function should perform all validation checks from the business logic. Use the provided in-memory data store structure.`}</CodeBlock>
                    </SubSection>
                    
                    <SubSection title="2. Generate and Refine the Code">
                        <p>Input your detailed prompt into Google AI Studio. Gemini will generate the Node.js/Express code. Review the output. It might be perfect, or it might need slight adjustments. You can use follow-up prompts to refine it, for example: "Add a check to ensure the user does not have another pending loan application."</p>
                    </SubSection>

                    <SubSection title="3. Integrate into Your Local Backend">
                        <p>Once you are satisfied, copy the generated code into your local backend files:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                           <li>Add the new controller function (e.g., `applyForLoan`) to the appropriate controller file (e.g., `backend/controllers/loansController.js`).</li>
                           <li>Add the new route definition to the corresponding route file (e.g., `backend/routes/loans.js`).</li>
                           <li>Ensure your backend server's `.env` file contains your \`API_KEY\` for any direct calls to the Gemini API (like our AI Co-Pilot).</li>
                        </ol>
                    </SubSection>

                    <SubSection title="4. Connect Your Frontend">
                        <p>With your new backend endpoint live on your local server, you can now call it from your frontend component (`LoansView.tsx`) using the provided `api` helper function, confident that the backend logic matches your UI's requirements.</p>
                        <CodeBlock>{`// Example call in LoansView.tsx
const result = await api('/loans/apply', { 
    method: 'POST', 
    body: JSON.stringify(applicationData) 
});`}</CodeBlock>
                    </SubSection>
                </Section>
                
                <Section title="Conclusion">
                    <p>By adopting this AI-assisted workflow, you dramatically reduce the friction between frontend design and backend implementation. It allows you, the frontend engineer, to drive the creation of the exact backend services you need, ensuring perfect alignment and accelerating the entire development lifecycle. Happy building!</p>
                </Section>
            </Card>
        </div>
    );
};

export default APIGuideView;
