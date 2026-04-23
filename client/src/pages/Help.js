import { useNavigate } from 'react-router-dom';
import {useState} from "react";
import './Help.css';
import React from 'react';

const Help = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        { id: 'getting-started', label: '🌸 Getting Started' },
        { id: 'scrapbooks', label: '📸 Scrapbooks' },
        { id: 'memories', label: '🌷 Memories' },
        { id: 'members', label: '👥 Members' },
        { id: 'print', label: '📖 Printing' },
        { id: 'capsules', label: '⏳ Time Capsules' },
        { id: 'letters', label: '💌 Letters to Future Self' },
        { id: 'pro', label: '⭐ Pro Plan' },
        { id: 'account', label: '👤 Your Account' },
    ];

    return (
        <div className="help-container">
            <nav className="navbar">
                <div className="navbar-logo" onClick={() => navigate('/home')}>ECHOES</div>
                <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
            </nav>

            <div className="help-content">
                <div className="help-sidebar">
                    <h3>Help Center</h3>
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`help-nav-btn ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                <div className="help-main">
                    {activeSection === 'getting-started' && (
                        <div className="help-section">
                            <h1>Getting Started 🌸</h1>
                            <p>Welcome to Echoes — your private shared scrapbook for the people you love.</p>

                            <h2>Creating your account</h2>
                            <p>Go to <strong>echoesmemo.xyz</strong> and click <strong>Get Started</strong>. Enter your name, email and password to create your free account. It takes less than 30 seconds.</p>

                            <h2>Your first scrapbook</h2>
                            <p>Once you're logged in click <strong>+ Create Scrapbook</strong> on your home page. Give it a title, add a description and optionally upload a cover image. Click <strong>Create</strong> and your scrapbook is ready!</p>

                            <h2>Inviting your people</h2>
                            <p>Open your scrapbook and click <strong>+ Invite Member</strong>. Enter their email address and click <strong>Invite</strong>. They'll receive an email with instructions to join. They need an Echoes account to view and add memories.</p>

                            <h2>Adding your first memory</h2>
                            <p>Inside your scrapbook click <strong>+ Add Memory</strong>. Upload a photo, add a title and description and click <strong>Add Memory</strong>. Everyone in the scrapbook will be notified instantly! 🔔</p>
                        </div>
                    )}

                    {activeSection === 'scrapbooks' && (
                        <div className="help-section">
                            <h1>Scrapbooks 📸</h1>

                            <h2>Creating a scrapbook</h2>
                            <p>From your home page click <strong>+ Create Scrapbook</strong>. Fill in the title, description and cover image then click <strong>Create</strong>.</p>

                            <h2>Editing a scrapbook</h2>
                            <p>On your scrapbook card click the <strong>✏️ Edit</strong> button. Update the title, description or cover image. You can also pick a cover from your existing memories by clicking <strong>🖼️ Pick from memories</strong>.</p>

                            <h2>Deleting a scrapbook</h2>
                            <p>On your scrapbook card click the <strong>Delete</strong> button. Note — only the owner of the scrapbook can delete it.</p>

                            <h2>Searching and sorting</h2>
                            <p>Use the search bar on your home page to find scrapbooks by title. Use the sort dropdown to sort by newest, oldest or author.</p>

                            <h2>Free plan limits</h2>
                            <p>Free accounts can create up to <strong>3 scrapbooks</strong>. Upgrade to Pro for unlimited scrapbooks.</p>
                        </div>
                    )}

                    {activeSection === 'memories' && (
                        <div className="help-section">
                            <h1>Memories 🌷</h1>

                            <h2>Adding a memory</h2>
                            <p>Open a scrapbook and click <strong>+ Add Memory</strong>. Upload a photo, add a title and description and click <strong>Add Memory</strong>. All members are notified instantly.</p>

                            <h2>Editing a memory</h2>
                            <p>Click the <strong>✏️ Edit</strong> button on any memory card to update the title, description or image.</p>

                            <h2>Pinning a memory</h2>
                            <p>Click the <strong>📌 Pin</strong> button on a memory card to pin it to the top of your scrapbook. Click again to unpin.</p>

                            <h2>Viewing full image</h2>
                            <p>Click on any memory image to view it in full screen. Click anywhere to close.</p>

                            <h2>Downloading an image</h2>
                            <p>Open the full screen view and click <strong>⬇️ Download</strong> to save the image to your device.</p>

                            <h2>Searching memories</h2>
                            <p>Use the search bar inside a scrapbook to find memories by title or description.</p>

                            <h2>Sorting memories</h2>
                            <p>Use the sort dropdown to sort memories by newest, oldest or author.</p>

                            <h2>Free plan limits</h2>
                            <p>Free accounts can add up to <strong>20 memories</strong> per scrapbook. Upgrade to Pro for unlimited memories.</p>
                        </div>
                    )}

                    {activeSection === 'members' && (
                        <div className="help-section">
                            <h1>Members 👥</h1>

                            <h2>Inviting a member</h2>
                            <p>Open a scrapbook and click <strong>+ Invite Member</strong>. Enter their email address and click <strong>Invite</strong>. They'll receive an email notification. They need an Echoes account to join.</p>

                            <h2>Inviting someone without an account</h2>
                            <p>Just enter their email — they'll receive an invitation email with a link to sign up and join your scrapbook automatically.</p>

                            <h2>Removing a member</h2>
                            <p>Open the invite section and click <strong>Remove [name]</strong> next to the member you want to remove. Only the scrapbook owner can remove members.</p>

                            <h2>Free plan limits</h2>
                            <p>Free accounts can invite up to <strong>5 members</strong> per scrapbook. Upgrade to Pro for unlimited members.</p>
                        </div>
                    )}

                    {activeSection === 'print' && (
                        <div className="help-section">
                            <h1>Printing Your Scrapbook 📖</h1>
                            <p>Pro users can turn their scrapbook into a real hardcover book shipped anywhere in the world.</p>

                            <h2>Requirements</h2>
                            <p>You need at least <strong>22 memories with images</strong> to print a book. You also need an active <strong>Pro subscription</strong>.</p>

                            <h2>How to print</h2>
                            <ol>
                                <li>Open a scrapbook with 22+ memories</li>
                                <li>Click <strong>📖 Print this Scrapbook</strong></li>
                                <li>Write a dedication note (optional)</li>
                                <li>Choose your cover style — Classic, Modern, Minimal or Custom</li>
                                <li>Pick your book size — Small ($35), Standard ($50) or Premium ($65)</li>
                                <li>Preview your book in 4 styles — Polaroid, Magazine, Classic or Minimal</li>
                                <li>Enter your shipping address</li>
                                <li>Review your order and pay</li>
                                <li>Your book is printed and shipped in 7-14 business days 📦</li>
                            </ol>

                            <h2>Book styles</h2>
                            <p><strong>Polaroid</strong> — classic white border with the photo and caption inside</p>
                            <p><strong>Magazine</strong> — full bleed image with elegant text overlay at the bottom</p>
                            <p><strong>Classic</strong> — image on one side, text on the other</p>
                            <p><strong>Minimal</strong> — just the image and title, beautifully simple</p>

                            <h2>Book sizes</h2>
                            <p><strong>Small</strong> — 25 pages, A5 size — $35</p>
                            <p><strong>Standard</strong> — 40 pages, 6x9 inches — $50</p>
                            <p><strong>Premium</strong> — 60 pages, A4 size — $65</p>

                            <h2>Shipping</h2>
                            <p>We ship anywhere in the world. Estimated delivery is 7-14 business days after your order is placed.</p>
                        </div>
                    )}

                    {activeSection === 'capsules' && (
                        <div className="help-section">
                            <h1>Time Capsules ⏳</h1>

                            <h2>What is a time capsule?</h2>
                            <p>A time capsule lets you lock memories, photos and a message and set a future date for when it unlocks. On that date everyone you invited gets notified and the capsule opens.</p>

                            <h2>Creating a time capsule</h2>
                            <p>Click the hamburger menu and select <strong>⏳ Time Capsules</strong>. Click <strong>+ Create Time Capsule</strong>, add a title, message and photos, set your unlock date and invite members by email. Click <strong>Lock Capsule 🔒</strong>.</p>

                            <h2>When does it unlock?</h2>
                            <p>On the unlock date Echoes automatically unlocks the capsule and sends everyone an email notification. You can then view the contents inside the app.</p>

                            <h2>Can I delete a capsule?</h2>
                            <p>Yes — only the creator of the capsule can delete it. Click <strong>Delete</strong> on the capsule card.</p>
                        </div>
                    )}

                    {activeSection === 'letters' && (
                        <div className="help-section">
                            <h1>Letters to Future Self 💌</h1>

                            <h2>What is a letter to future self?</h2>
                            <p>Write a personal letter today and choose a date for when you want to receive it. On that date the letter is delivered to your email inbox — from your past self.</p>

                            <h2>Writing a letter</h2>
                            <p>Click the hamburger menu and select <strong>💌 Letters to Future Self</strong>. Click <strong>+ Write a Letter</strong>, add a title and write your letter. Set your delivery date and click <strong>Seal & Send 💌</strong>.</p>

                            <h2>When will I receive it?</h2>
                            <p>On your chosen delivery date Echoes sends the letter directly to your email inbox. Make sure your email is correct on your account.</p>

                            <h2>Can I read it before the date?</h2>
                            <p>No — letters are sealed until the delivery date. That's the magic of it! 🌸</p>

                            <h2>Can I delete a letter?</h2>
                            <p>Yes — click <strong>Delete</strong> on the letter card to delete it before it's delivered.</p>
                        </div>
                    )}

                    {activeSection === 'pro' && (
                        <div className="help-section">
                            <h1>Pro Plan ⭐</h1>

                            <h2>What do I get with Pro?</h2>
                            <p>Pro unlocks everything on Echoes:</p>
                            <ul>
                                <li>✅ Unlimited scrapbooks</li>
                                <li>✅ Unlimited members per scrapbook</li>
                                <li>✅ Unlimited memories per scrapbook</li>
                                <li>✅ Physical hardcover book printing</li>
                                <li>✅ Priority support</li>
                                <li>✅ Early access to new features</li>
                            </ul>

                            <h2>How much does Pro cost?</h2>
                            <p><strong>Monthly</strong> — $3/month</p>
                            <p><strong>Yearly</strong> — $25/year (save $11)</p>

                            <h2>How do I upgrade?</h2>
                            <p>Click the hamburger menu and tap <strong>⭐ Upgrade to Pro</strong>. Choose your plan and complete the payment via Paystack.</p>

                            <h2>When does my Pro expire?</h2>
                            <p>Monthly plans expire after 30 days. Yearly plans expire after 365 days. You'll receive a reminder email 3 days before expiry. There's also a 3 day grace period after expiry before Pro access is removed.</p>

                            <h2>How do I renew?</h2>
                            <p>Go to <strong>⭐ Upgrade to Pro</strong> in the menu and purchase a new plan.</p>
                        </div>
                    )}

                    {activeSection === 'account' && (
                        <div className="help-section">
                            <h1>Your Account 👤</h1>

                            <h2>Changing your profile picture</h2>
                            <p>Click on your profile picture or placeholder in the navbar. Select a new image from your device and it will update automatically.</p>

                            <h2>Editing your username</h2>
                            <p>Click on your username in the navbar. Type your new username and click <strong>Save</strong>.</p>

                            <h2>Changing your password</h2>
                            <p>Click the hamburger menu and select <strong>🔒 Change Password</strong>. Enter your current password and your new password and click <strong>Change Password</strong>.</p>

                            <h2>Forgot your password?</h2>
                            <p>On the login page click <strong>Reset it</strong> under the login button. Enter your email and we'll send you a reset link. The link expires in 1 hour.</p>

                            <h2>Logging out</h2>
                            <p>Click the hamburger menu and tap <strong>🚪 Logout</strong>.</p>

                            <h2>Need more help?</h2>
                            <p>Email us at <strong>echoesmemo.noreply@gmail.com</strong> and we'll get back to you as soon as possible 🌸</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Help;