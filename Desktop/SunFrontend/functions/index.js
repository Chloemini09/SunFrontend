const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const cors = require("cors")({origin: true});
const axios = require("axios");

const apiKey =
  "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";
sgMail.setApiKey(apiKey);


exports.sendWelcomeEmail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const {email, username} = req.body;

    const msg = {
      to: email,
      from: "minichloe99@gmail.com",
      subject: "Welcome to Mindwell!",
      text: `Hi ${username}, Welcome to Mindwell!
      If you have any questions, Please reply this email.`,
      html: `<strong>Hi ${username}, Welcome to Mindwell!</strong>`,
    };

    sgMail
        .send(msg)
        .then(() => {
          return res.status(200).send({message: "Email successfully"});
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          return res.status(500).send({error: "email failed"});
        });
  });
});

exports.sendEmail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const {email, subject, text, html} = req.body;

    const msg = {
      to: email,
      from: "minichloe99@gmail.com",
      subject: subject,
      text: text,
      html: html,
    };

    sgMail
        .send(msg)
        .then(() => {
          return res.status(200).send({message: "Email sent successfully"});
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          return res.status(500).send({error: "Failed to send email"});
        });
  });
});

exports.sendCSVReport = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {email, csvContent} = req.body;

    console.log("Received email:", email);
    console.log("Received CSV content:", csvContent);

    if (!csvContent) {
      console.error("CSV content is missing");
      return res.status(400).send({error: "CSV content is missing"});
    }

    try {
      const cleanedCsvContent = csvContent.replace(/\r?\n|\r/g, "\n");

      const bufferContent = Buffer.from(
          cleanedCsvContent, "utf-8").toString("base64");

      console.log("Buffer content (base64):", bufferContent);

      const msg = {
        to: email,
        from: "minichloe99@gmail.com",
        subject: "Your Test History Report",
        text: "Please find attached your test history report.",
        attachments: [
          {
            content: bufferContent,
            filename: "test_history.csv",
            type: "text/csv",
            disposition: "attachment",
          },
        ],
      };

      await sgMail.send(msg);
      console.log("Email sent successfully");
      return res.status(200).send({message: "Report sent successfully"});
    } catch (error) {
      console.error("Error sending report:", error);
      return res.status(500).send({error: "Failed to send report"});
    }
  });
});
