"use client";
import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const generateCertificate = async (title, date, username) => {
  const certificateRef = document.createElement('div');
  certificateRef.innerHTML = `
    <div id="certificate" style="
      width: 800px;
      height: 600px;
      padding: 20px;
      text-align: center;
      background: linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%);
      border: 15px solid #1e88e5;
      border-radius: 15px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      position: fixed;
      top: -1000px;
      font-family: 'Poppins', sans-serif;
    ">
      <div style="
        width: 100%;
        height: 100%;
        padding: 20px;
        border: 3px dashed #1e88e5;
        border-radius: 12px;
        position: relative;
      ">
        <div style="font-size: 50px; font-weight: 700; color: #1e88e5; margin-bottom: 20px;">
          Certificate of Appreciation
        </div>
        <div style="font-size: 22px; color: #555; margin: 10px;">
          This certificate is proudly awarded to
        </div>
        <div style="font-size: 30px; font-weight: 600; color: #333; margin: 20px;">
          ${username}
        </div>
        <div style="font-size: 20px; color: #555; margin: 10px;">
          For their outstanding contribution in conducting the class
        </div>
        <div style="font-size: 26px; font-weight: 700; color: #1e88e5; margin: 20px;">
          "${title}"
        </div>
        <div style="font-size: 18px; color: #666; margin: 20px;">
          Held on ${new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <div style="font-size: 24px; font-weight: 600; color: #333; margin-top: 40px;">
          SustainEarth
        </div>
        <div style="
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 14px;
          color: #888;
          text-align: center;
        ">
          Certificate ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(certificateRef);

  try {
    const canvas = await html2canvas(document.querySelector('#certificate'), {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [800, 600],
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 800, 600);
    pdf.save(`${username}_certificate_${title}.pdf`);
  } catch (error) {
    console.error('Certificate generation error:', error);
    throw new Error('Failed to generate certificate');
  } finally {
    document.body.removeChild(certificateRef);
  }
};

export const handleCertificateGeneration = async (teaching, username) => {
  try {
    const title = teaching.title || teaching[1] || "Untitled";
    const date = teaching.date || teaching[0];
    await generateCertificate(title, date, username);
    return true;
  } catch (error) {
    console.error('Certificate generation error:', error);
    return false;
  }
};

export default generateCertificate;
