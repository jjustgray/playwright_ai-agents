export const runtimeEnv = process.env;

export function buildBookingEmail(iterationIndex: number): string {
  const configuredEmail = runtimeEnv.CALENDLY_TEST_EMAIL;
  if (!configuredEmail) {
    throw new Error(
      'Set CALENDLY_TEST_EMAIL to a controlled test inbox before enabling live bookings.',
    );
  }

  const emailParts = configuredEmail.split('@');
  if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
    throw new Error('CALENDLY_TEST_EMAIL must be a valid email address.');
  }

  return `${emailParts[0]}-valtive-${iterationIndex}@${emailParts[1]}`;
}
