// Declare nodemailer module to satisfy TypeScript if types are missing
declare module 'nodemailer' {
	const nodemailer: any
	export default nodemailer
}