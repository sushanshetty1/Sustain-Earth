import React from 'react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Terms of Service</h1>
      
      <div className="space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-3">1. Introduction</h2>
          <p>
            Welcome to our sustainable development platform. These Terms of Service govern your use of our platform. 
            By accessing or using our services, you agree to be bound by these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-3">2. Environmental Commitment</h2>
          <p>
            Our platform is dedicated to promoting sustainable development practices and environmental conservation. 
            Users are expected to respect and support these principles while using our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-3">3. User Responsibilities</h2>
          <div className="pl-4">
            <p>Users agree to:</p>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Provide accurate and truthful information</li>
              <li>Support sustainable development goals</li>
              <li>Respect intellectual property rights</li>
              <li>Maintain account confidentiality</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-3">4. Content Guidelines</h2>
          <div className="pl-4">
            <p>All content must align with sustainable development principles and must not:</p>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Promote environmentally harmful practices</li>
              <li>Contain misleading information about climate change</li>
              <li>Violate environmental protection laws</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-3">5. Privacy and Data</h2>
          <p>
            We are committed to protecting your privacy and personal data. Please refer to our Privacy Policy 
            for detailed information about how we collect, use, and protect your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-3">6. Contact</h2>
          <p>
            For questions about these terms, please contact:
            <br />
            Email: support@sustainabledevelopment.com
            <br />
            Address: 123 Green Street, Eco City, EC 12345
          </p>
        </section>

        <section className="pt-4 text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;