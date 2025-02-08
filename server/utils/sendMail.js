import { createTransport } from 'nodemailer';

const sendMail = async (email, subject, repositoryName, inviterName) => {
    const transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: process.env.Gmail,
            pass: process.env.Password
        }
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Repository Collaboration Invitation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: #4CAF50; /* Green text */
        }
        p {
            margin-bottom: 20px;
            color: #666;
        }
        .repo-name {
            font-size: 24px;
            font-weight: bold;
            color: #007BFF; /* Blue text for repository name */
            margin-bottom: 20px;
        }
        .invite-message {
            font-size: 16px;
            color: #555;
            margin-bottom: 30px;
        }
        .button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
        .button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>You're Invited to Collaborate!</h1>
        <p class="invite-message">Hello ${email},</p>
        <p>You have been invited by ${inviterName} to become a collaborator on the repository <span class="repo-name">${repositoryName}</span>.</p>
        <p>If you'd like to accept the invitation and join the project, click the button below:</p>
        <a href="www.google.com" class="button">Accept Invitation</a>
    </div>
</body>
</html>
`;

    await transporter.sendMail({
        from: process.env.Gmail,
        to: email,
        subject: subject,
        html: html
    });
}

export default sendMail;
