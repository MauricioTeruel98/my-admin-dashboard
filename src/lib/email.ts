import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    
})

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Restablecimiento de contraseña',
        html: `
            <p>Has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para continuar:</p>
            <a href="${resetUrl}">${resetUrl}</a>
        `
    })
}