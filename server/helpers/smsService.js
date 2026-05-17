/**
 * SMS Service Simulation
 * In a real production environment, integrate with Twilio, eSMS.vn, or other providers.
 */

const sendVerificationSMS = async (phone, code) => {
    // SIMULATION: Log the OTP to console
    console.log(`\n--- [SMS SIMULATION] ---`);
    console.log(`TO: ${phone}`);
    console.log(`MESSAGE: Ma xac thuc Saint Laurent cua ban la: ${code}. Het han trong 15 phut.`);
    console.log(`------------------------\n`);
    
    // Return a resolved promise as if it succeeded
    return Promise.resolve({ success: true, message: "SMS sent successfully (simulated)" });
};

module.exports = { sendVerificationSMS };
