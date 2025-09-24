// Declare nodemailer module to satisfy TypeScript if types are missing
declare module 'nodemailer' {
	const nodemailer: typeof import('nodemailer')
	export default nodemailer
  }
  