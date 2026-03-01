
/* was a pain in the ass*/

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const scorpionPurple = chalk.hex('#A020F0');
const scorpionBlue = chalk.hex('#1DA1F2');
const scorpionPink = chalk.hex('#FF69B4');
const scorpionGreen = chalk.hex('#2ECC71');
const scorpionOrange = chalk.hex('#FFA500');
const scorpionGold = chalk.hex('#FFD700');
const scorpionRed = chalk.hex('#E74C3C');
const scorpionYellow = chalk.hex('#F1C40F');

const BOT_SYMBOL = '👁️';
const MESSAGE_SYMBOL = '✉';
const USER_SYMBOL = '👤';
const GROUP_SYMBOL = '👥';
const TYPE_SYMBOL = '📋';
const CONTENT_SYMBOL = '📝';
const ERROR_SYMBOL = '⚠️';
const SUCCESS_SYMBOL = '✅';
const WARNING_SYMBOL = '⚠️';
const BROADCAST_SYMBOL = '📢';
const ID_SYMBOL = '🆔';

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

class KeithLogger {
    static setClientInstance(clientInstance) {
        this.client = clientInstance;
    }

    static async logMessage(m) {
        try {
            if (!this.client) {
                console.log(keithYellow.bold(`${WARNING_SYMBOL} KeithLogger: Client instance not set yet`));
                return;
            }

            const isGroup = m.isGroup;
            const isBroadcast = m.isBroadcast || false;
            const remoteJid = m.remoteJid || '';
            const senderName = m.pushName || m.senderName || 'Unknown User';
            const senderId = m.sender || 'Unknown ID';
            const messageType = m.mtype || 'Unknown Type';
            const text = m.text || '';

            // Get group name if it's a group
            let groupName = 'Unknown Group';
            let groupId = '';
            
            if (isGroup && remoteJid) {
                try {
                    const groupMetadata = await this.client.groupMetadata(remoteJid).catch(() => null);
                    if (groupMetadata?.subject) {
                        groupName = groupMetadata.subject;
                    }
                    groupId = remoteJid.split('@')[0];
                } catch (e) {
                    groupName = 'Group Chat';
                    groupId = remoteJid.split('@')[0];
                }
            }

            // Extract and format IDs
            let phoneNumber = 'Unknown';
            let lidInfo = '';
            let jidInfo = '';
            
            if (senderId && senderId.includes('@')) {
                const baseId = senderId.split('@')[0];
                
                if (senderId.endsWith('@lid')) {
                    // It's a LID
                    phoneNumber = baseId;
                    lidInfo = `LID: ${baseId}`;
                    
                    // Try to get JID from LID if it's a group
                    if (isGroup && remoteJid) {
                        try {
                            const groupMetadata = await this.client.groupMetadata(remoteJid).catch(() => null);
                            if (groupMetadata?.participants) {
                                const participant = groupMetadata.participants.find(p => 
                                    p.id === senderId || p.lid === senderId || p.pn === senderId
                                );
                                if (participant?.pn) {
                                    jidInfo = `JID: ${participant.pn.split('@')[0]}`;
                                }
                            }
                        } catch (e) {
                            // Ignore errors in JID lookup
                        }
                    }
                } else {
                    // It's a regular JID
                    phoneNumber = baseId;
                    jidInfo = `JID: ${baseId}`;
                    
                    // Try to get LID from JID if it's a group
                    if (isGroup && remoteJid) {
                        try {
                            const groupMetadata = await this.client.groupMetadata(remoteJid).catch(() => null);
                            if (groupMetadata?.participants) {
                                const participant = groupMetadata.participants.find(p => 
                                    p.pn === senderId || p.id === senderId
                                );
                                if (participant?.id && participant.id.endsWith('@lid')) {
                                    lidInfo = `LID: ${participant.id.split('@')[0]}`;
                                } else if (participant?.lid) {
                                    lidInfo = `LID: ${participant.lid.split('@')[0]}`;
                                }
                            }
                        } catch (e) {
                            // Ignore errors in LID lookup
                        }
                    }
                }
            }

            console.log(scorpionPurple.bold(`\t ${BOT_SYMBOL} ${BOT_SYMBOL} ${BOT_SYMBOL} { S C O R P I O N - M D } ${BOT_SYMBOL} ${BOT_SYMBOL} ${BOT_SYMBOL}`));
            console.log(scorpionGold.bold("╔════════════════════════════╗"));
            
            if (isBroadcast) {
                console.log(scorpionGold.bold(`║ ${BROADCAST_SYMBOL}  B R O A D C A S T  ${BROADCAST_SYMBOL} ║`));
            } else {
                console.log(scorpionGold.bold(`║ ${MESSAGE_SYMBOL}   N E W   M E S S A G E   ${MESSAGE_SYMBOL} ║`));
            }
            console.log(scorpionGold.bold("╚════════════════════════════╝"));
            
            if (isBroadcast) {
                console.log(scorpionOrange(`${BROADCAST_SYMBOL} Broadcast Status from: `) + scorpionBlue.bold(senderName));
            } else if (isGroup) {
                console.log(scorpionOrange(`${GROUP_SYMBOL} Group: `) + scorpionGold.bold(groupName));
                console.log(scorpionOrange(`   ↳ Group ID: `) + scorpionOrange(`(${groupId})`));
                console.log(scorpionOrange(`${USER_SYMBOL} Sender: `) + scorpionPink.bold(`[${senderName}]`));
                
                // Show both LID and JID if available
                if (lidInfo || jidInfo) {
                    console.log(keithGreen(`${ID_SYMBOL} IDs: `) + keithOrange(lidInfo ? lidInfo : jidInfo));
                    if (lidInfo && jidInfo) {
                        console.log(scorpionGreen(`   ↳ `) + keithOrange(jidInfo));
                    }
                } else {
                    console.log(keithGreen(`${ID_SYMBOL} ID: `) + scorpionOrange(`(${phoneNumber})`));
                }
            } else {
                console.log(keithGreen(`${USER_SYMBOL} Private Chat with: `) + 
                    keithPink.bold(`[${senderName}] `) + 
                    keithOrange(`(${phoneNumber})`));
            }
            
            console.log(keithGreen(`${TYPE_SYMBOL} Message Type: `) + keithBlue.bold(messageType));
            
            if (text && text.trim() !== '') {
                console.log(keithGold.bold("┌────────────────────────────┐"));
                console.log(keithGreen(`${CONTENT_SYMBOL} Content:`));
                console.log(keithGold.bold("├────────────────────────────┤"));
                
                // Handle long text by splitting into lines
                const maxLineLength = 50;
                if (text.length > maxLineLength) {
                    const words = text.split(' ');
                    let line = '';
                    words.forEach(word => {
                        if ((line + word).length > maxLineLength) {
                            console.log(chalk.whiteBright('  ' + line));
                            line = word + ' ';
                        } else {
                            line += word + ' ';
                        }
                    });
                    if (line.trim()) {
                        console.log(chalk.whiteBright('  ' + line.trim()));
                    }
                } else {
                    console.log(chalk.whiteBright('  ' + text));
                }
                
                console.log(keithGold.bold("└────────────────────────────┘"));
            }
            
            // File logging
            const today = new Date().toISOString().split('T')[0];
            const logFile = path.join(logsDir, `messages_${today}.log`);
            
            let logEntry = `[${new Date().toISOString()}] `;
            if (isBroadcast) {
                logEntry += `BROADCAST | Sender: ${senderName} (${phoneNumber}) | `;
            } else if (isGroup) {
                let idInfo = '';
                if (lidInfo && jidInfo) {
                    idInfo = ` | ${lidInfo}, ${jidInfo}`;
                } else if (lidInfo) {
                    idInfo = ` | ${lidInfo}`;
                } else if (jidInfo) {
                    idInfo = ` | ${jidInfo}`;
                } else {
                    idInfo = ` | ID: ${phoneNumber}`;
                }
                logEntry += `GROUP: ${groupName} (${groupId}) | Sender: ${senderName}${idInfo} | `;
            } else {
                logEntry += `PRIVATE | Sender: ${senderName} (${phoneNumber}) | `;
            }
            logEntry += `Type: ${messageType} | Content: ${text}\n`;
            
            fs.appendFileSync(logFile, logEntry);
            
        } catch (error) {
            console.log(keithRed.bold(`${ERROR_SYMBOL} Error in logMessage: ${error.message}`));
        }
    }

    static error(message, error) {
        console.log(keithRed.bold(`${ERROR_SYMBOL} [ERROR] ${message}`));
        if (error) {
            console.log(keithRed(error.stack || error.message));
        }
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `errors_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [ERROR] ${message}\n${error ? (error.stack || error.message) : ''}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static success(message) {
        console.log(keithGreen.bold(`${SUCCESS_SYMBOL} [SUCCESS] ${message}`));
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `success_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [SUCCESS] ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static warning(message) {
        console.log(keithYellow.bold(`${WARNING_SYMBOL} [WARNING] ${message}`));
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `warnings_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [WARNING] ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static info(message) {
        console.log(keithBlue.bold(`[INFO] ${message}`));
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `info_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [INFO] ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }
}

module.exports = scorpionLogger;
