const {
	Event,
	City,
	User,
	EventCategory,
	BookEvents,
	EventTickets,
	Payment,
	Transactions,
	PromoCode,
	NewUser,
	EventAddress,
} = require("../models");
const sequelize = require("sequelize");
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const nodemailer = require('nodemailer');
const bwipjs = require('bwip-js');
const fs = require('fs');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientIdNew = process.env.GOOGLE_CLIENT_ID1;

const { OAuth2Client } = require('google-auth-library');
const APPLE_AUTH_KEY_URL = 'https://appleid.apple.com/auth/keys';
const axios = require('axios');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	}
});

module.exports.insertEvent = async (req, res) => {

	try {
		console.log('req.files', req.file)
		const eventData = req.body;
		console.log({ eventData })
		let city_name = req.body.events.city_name;
		console.log('cityName', city_name)
		if (city_name) {
			const city = await City.findOne({
				where: sequelize.where(
					sequelize.fn('LOWER', sequelize.col('city')),
					sequelize.fn('LOWER', city_name)
				),
			});

			if (eventData && city) {
				const city_id = city.id;
				const events = eventData.events;
				const link = eventData.link ? eventData.link : '';
				const user_id = eventData.user_id;
				// const event_category = eventData.category_id;
				// // check event category weather it exists or not
				// if(!await EventCategory.findByPk(event_category)){
				//   return res.status(400).json({ error: 'Event category not found' });
				// }

				if (city_id && events && user_id) {
					const slug = events.title
						.toLowerCase()
						.replace(/[^a-z0-9]/g, '-')
						.replace(/-{2,}/g, '-')
						.replace(/^-|-$/g, '');
					events.slug = slug;
					// console.log("events", events) 
					const event = await Event.create({
						city_id: city_id,
						events: events,
						link: link,
						user_id: user_id,
					});

					res.json({ status: true, event });
				} else {
					res.status(400).json({ error: 'Missing parameters in event data' });
				}
			} else {
				res.status(400).json({ error: 'Missing event data in the request body' });
			}
		} else {
			res.status(400).json({ error: 'Missing city name in event data' });
		}
	} catch (error) {
		return res.status(500).send({
			status: false,
			error: error.message,
		});
	}
}

// module.exports.insertEvents = async (req, res) => {
// 	try {
// 		console.log('req.files', req.files)
// 		const eventData = req.body;
// 		console.log({ eventData });
// 		const city_name = req.body.city_name;
// 		console.log('cityName', city_name);
// 		if (!city_name) {
// 			return res.status(400).json({ error: 'Missing city name in event data' });
// 		}

// 		const city = await City.findOne({
// 			where: sequelize.where(
// 				sequelize.fn('LOWER', sequelize.col('city')),
// 				sequelize.fn('LOWER', city_name)
// 			),
// 		});

// 		if (!city) {
// 			return res.status(400).json({ error: 'City not found' });
// 		}

// 		const city_id = city.id;
// 		const events = eventData;
// 		const link = eventData.link ? eventData.link : '';
// 		const user_id = eventData.user_id;

// 		if (!events || !user_id) {
// 			return res.status(400).json({ error: 'Missing parameters in event data' });
// 		}

// 		const slug = events.title
// 			.toLowerCase()
// 			.replace(/[^a-z0-9]/g, '-')
// 			.replace(/-{2,}/g, '-')
// 			.replace(/^-|-$/g, '');

// 		events.slug = slug;

// 		const event = await Event.create({
// 			city_id,
// 			events,
// 			link,
// 			user_id,
// 		});
// 		console.log("EventTicket", eventData.eventTickets)
// 		if (eventData.eventTickets && Array.isArray(eventData.eventTickets)) {
// 			const eventTicketsData = [];
// 			for (const ticket of eventData.eventTickets) {
// 				const eventTicket = await EventTickets.create({
// 					eventId: event.id,
// 					planName: ticket.planName,
// 					price: ticket.price,
// 					number_available: ticket.total_number,
// 					total_number: ticket.number,
// 					description: ticket.description
// 				});
// 				eventTicketsData.push(eventTicket);
// 			}
// 			return res.json({ status: true, event, eventTickets: eventTicketsData });
// 		} else {
// 			return res.status(400).json({ status: false, error: 'Missing or invalid eventTickets data' });
// 		}
// 	} catch (error) {
// 		console.error(error);
// 		return res.status(500).send({
// 			status: false,
// 			error: error.message,
// 		});
// 	}
// };

// module.exports.bookEvent = async (req, res) => {
// 	try {
// 		const { userId, firstName, lastName, email, phoneNumber, bookings } = req.body;

// 		if (!userId || !firstName || !lastName || !email || !phoneNumber) {
// 			return res.status(400).json({ error: 'Missing user details' });
// 		}

// 		if (!bookings || bookings.length === 0) {
// 			return res.status(400).json({ error: 'Missing or empty bookings array' });
// 		}
// 		console.log("bookings.length", bookings.length)
// 		const userTicketCounts = {};
// 		const userTotalAmounts = {};

// 		for (let i = 0; i < bookings.length; i++) {
// 			const booking = bookings[i];
// 			const { id, planId, price, quantity, eventId } = booking;

// 			if (!id || !planId || !price || !quantity || !eventId) {
// 				return res.status(400).json({ error: 'Missing required parameters in booking' });
// 			}

// 			const eventTickets = await EventTickets.findOne({ where: { eventId } });

// 			if (!eventTickets || eventTickets.number_available < quantity) {
// 				return res.status(400).json({ status: false, error: `Insufficient available tickets for the event with eventId: ${eventId},for ${planId} plan`});
// 				// return res.status(400).json({ status: false, error: `Invalid ticket quantity'`});

// 			}

// 			const existingBooking = await BookEvents.findOne({ where: { userId, eventId, planId } });

// 			if (existingBooking) {
// 				await BookEvents.update({
// 					amount: price,
// 					firstName,
// 					lastName,
// 					email,
// 					phoneNumber
// 				}, { where: { userId, eventId, planId } });

// 				if (userTicketCounts[userId]) {
// 					userTicketCounts[userId] += 1;
// 				} else {
// 					userTicketCounts[userId] = 1;
// 				}

// 				if (!userTotalAmounts[userId]) {
// 					userTotalAmounts[userId] = 0;
// 				}

// 				userTotalAmounts[userId] += price * quantity;
// 			} else {
// 				await BookEvents.create({
// 					userId,
// 					eventId,
// 					amount: price,
// 					firstName,
// 					lastName,
// 					email,
// 					phoneNumber,
// 					planId
// 				});

// 				userTicketCounts[userId] = 1;
// 				userTotalAmounts[userId] = price * quantity;
// 			}


// 			const updatedEventTickets = await EventTickets.findByPk(id);

// 			if (!updatedEventTickets) {
// 				console.error(`Event tickets not found for eventId: ${eventId}`);
// 				continue;
// 			}

// 			let newNumberAvailable = updatedEventTickets.number_available - quantity;

// 			console.log(updatedEventTickets.number_available, newNumberAvailable, quantity, "newNumberAvailable++++++++++=")
// 			if (newNumberAvailable === 0) {
// 				await EventTickets.update({ status: 'sold out' }, { where: { id: id } });
// 			} else if (newNumberAvailable < 0) {
// 				return res.status(400).json({status: false, error: `Insufficient available tickets for the event with eventId: ${eventId},for ${planId} plan`});
// 			}

// 			await EventTickets.update({
// 				number_available: newNumberAvailable
// 			},
// 				{
// 					where: {
// 						id: id,
// 					}
// 				});

// 			if (newNumberAvailable === 0) {
// 				await EventTickets.update({ status: 'sold out' }, { where: { eventId } });
// 			}
// 		}

// 		const eventIds = bookings.map(booking => booking.eventId);
// 		const totalEventTickets = await EventTickets.sum('number_available', { where: { eventId: eventIds } });

// 		return res.status(201).json({
// 			status: true,
// 			message: 'Events booked successfully',
// 			event_status: totalEventTickets === 0 ? 'sold out' : 'available',
// 			userTicketCounts: userTicketCounts,
// 			userTotalAmounts: userTotalAmounts
// 		});
// 	} catch (error) {
// 		console.error(error);
// 		return res.status(500).json({ status: false, message: error.message || 'Server error' });
// 	}
// };

module.exports.insertEvents = async (req, res) => {
	try {
		console.log('req.files', req.files)
		const eventData = req.body;
		console.log({ eventData });
		const city_name = req.body.city_name;
		console.log('cityName', city_name);
		if (!city_name) {
			return res.status(400).json({ error: 'Missing city name in event data' });
		}

		const city = await City.findOne({
			where: sequelize.where(
				sequelize.fn('LOWER', sequelize.col('city')),
				sequelize.fn('LOWER', city_name)
			),
		});

		if (!city) {
			return res.status(400).json({ error: 'City not found' });
		}

		const city_id = city.id;
		const events = eventData;
		const link = eventData.link ? eventData.link : '';
		const user_id = eventData.user_id;
		const year = eventData.year;

		if (!events || !user_id) {
			return res.status(400).json({ error: 'Missing parameters in event data' });
		}

		let slug = events.title
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '-')
			.replace(/-{2,}/g, '-')
			.replace(/^-|-$/g, '');

		const existingEvents = await Event.findAll({
			where: {
				'events.slug': slug
			}
		});

		// If a record with the same slug exists, append a count to make it unique
		if (existingEvents.length > 0) {
			let count = 1;

			// Define a recursive function to generate a unique slug
			const generateUniqueSlug = async (baseSlug, counter) => {
				let newSlug = baseSlug + '-' + counter;
				const existingEventsWithCount = await Event.findAll({
					where: {
						'events.slug': newSlug
					}
				});

				if (existingEventsWithCount.length > 0) {
					return generateUniqueSlug(baseSlug, counter + 1);
				} else {
					return newSlug;
				}
			};

			slug = await generateUniqueSlug(slug, count);
		}

		events.slug = slug;



		const event = await Event.create({
			city_id,
			events,
			link,
			user_id,
			year,
		});
		console.log("EventTicket", eventData.eventTickets)
		if (eventData.eventTickets && Array.isArray(eventData.eventTickets)) {
			const eventTicketsData = [];
			for (const ticket of eventData.eventTickets) {
				const eventTicket = await EventTickets.create({
					eventId: event.id,
					planName: ticket.planName,
					price: ticket.price,
					number_available: ticket.total_number,
					total_number: ticket.number,
					description: ticket.description
				});
				eventTicketsData.push(eventTicket);
			}
			return res.json({ status: true, event, eventTickets: eventTicketsData });
		} else {
			return res.status(400).json({ status: false, error: 'Missing or invalid eventTickets data' });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).send({
			status: false,
			error: error.message,
		});
	}
};
const { v4: uuidv4 } = require('uuid');

function generateBookingId() {
	const uuid = uuidv4().replace(/-/g, '');
	return uuid.substr(0, 15);
}

// module.exports.bookEvent = async (req, res) => {
//     try {
//         const { userId, firstName, lastName, email, phoneNumber, transactionId, bookings } = req.body;

//         if (!userId || !firstName || !lastName || !email || !phoneNumber || !transactionId) {
//             return res.status(400).json({ error: 'Missing user details or transaction ID' });
//         }

//         if (!bookings || bookings.length === 0) {
//             return res.status(400).json({ error: 'Missing or empty bookings array' });
//         }

//         const userTicketCounts = {};
//         const userTotalAmounts = {};
//         const bookedEvents = [];
//         const eventIds = [];
//         const bookingId = generateBookingId();
//         const bookedTickets = [];

//         for (let i = 0; i < bookings.length; i++) {
//             const booking = bookings[i];
//             const { eventId, planId, price, quantity } = booking;

//             if (!eventId || !planId || !price || !quantity) {
//                 return res.status(400).json({ error: 'Missing required parameters in booking' });
//             }

//             eventIds.push(eventId);

//             const eventTickets = await EventTickets.findOne({ where: { eventId, planName: planId } });

//             if (!eventTickets || eventTickets.number_available < quantity) {
//                 return res.status(400).json({ status: false, error: `Insufficient available tickets for the event with eventId: ${eventId}, for ${planId} plan` });
//             }

//             for (let j = 0; j < quantity; j++) {
//                 const ticketNumber = generateTicketNumber();

//                 const bookedTicket = {
//                     bookingId,
//                     userId,
//                     eventId,
//                     amount: price,
//                     firstName,
//                     lastName,
//                     email,
//                     phoneNumber,
//                     planId,
//                     quantity: 1,
//                     transactionId,
//                     ticketNumber // Storing ticketNumber directly, not in an array
//                 };
//                 bookedTickets.push(bookedTicket);

//                 await BookEvents.create(bookedTicket);

//                 userTicketCounts[userId] = (userTicketCounts[userId] || 0) + 1;
//                 userTotalAmounts[userId] = (userTotalAmounts[userId] || 0) + price;

//                 const eventIndex = bookedEvents.findIndex(event => event.eventDetails.id === eventId);
//                 if (eventIndex === -1) {
//                     const event = await Event.findByPk(eventId);
//                     if (event) {
//                         bookedEvents.push({ eventDetails: event.toJSON() });
//                     }
//                 }
//             }

//             await EventTickets.update(
//                 { number_available: eventTickets.number_available - quantity },
//                 { where: { id: eventTickets.id } }
//             );
//         }

//         const totalEventTickets = await EventTickets.sum('number_available', { where: { eventId: eventIds } });
//         const eventTicketsData = await EventTickets.findAll({ where: { eventId: eventIds } });
//         const bookedPlan = bookings[0].planId;

//         // Sending the response
//         const response = {
//             status: true,
//             message: 'Events booked successfully',
//             event_status: totalEventTickets === 0 ? 'sold out' : 'available',
//             userTicketCounts,
//             userTotalAmounts,
//             bookingId,
//             bookedEvents,
//             eventTickets: bookedTickets // Return bookedTickets array directly
//         };

//         return res.status(201).json(response);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ status: false, message: error.message || 'Server error' });
//     }
// };

module.exports.bookEvent = async (req, res) => {
	try {
		const { userId, firstName, lastName, email, phoneNumber, transactionId, bookings } = req.body;
		const paymentStatus = "unpaid";

		if (!userId || !firstName || !lastName || !email || !phoneNumber || !transactionId) {
			return res.status(400).json({ error: 'Missing user details or transaction ID' });
		}

		if (!bookings || bookings.length === 0) {
			bookings[i].paymentStatus = "unpaid";
			return res.status(400).json({ error: 'Missing or empty bookings array' });
		}

		const userTicketCounts = {};
		const userTotalAmounts = {};
		const bookedEvents = [];
		const eventIds = [];
		const bookingId = generateBookingId();
		const bookedTickets = [];

		for (let i = 0; i < bookings.length; i++) {
			const booking = bookings[i];
			const { eventId, planId, price, quantity } = booking;

			if (!eventId || !planId || !price || !quantity) {
				return res.status(400).json({ error: 'Missing required parameters in booking' });
			}

			eventIds.push(eventId);

			const event = await Event.findByPk(eventId);
			if (!event) {
				return res.status(404).json({ error: `Event with ID ${eventId} not found` });
			}

			// Check if the user is not the owner of the event
			if (event.user_id === userId) {
				return res.status(400).json({ error: 'User cannot book their own event' });
			}

			const eventTickets = await EventTickets.findOne({ where: { eventId, planName: planId } });

			if (!eventTickets || eventTickets.number_available < quantity) {
				return res.status(400).json({ status: false, error: `Insufficient available tickets for the event with eventId: ${eventId}, for ${planId} plan` });
			}

			for (let j = 0; j < quantity; j++) {
				const ticketNumber = generateTicketNumber();

				const bookedTicket = {
					bookingId,
					userId,
					eventId,
					amount: price,
					firstName,
					lastName,
					email,
					phoneNumber,
					planId,
					quantity: 1,
					transactionId,
					paymentStatus,
					ticketNumber // Storing ticketNumber directly, not in an array
				};
				bookedTickets.push(bookedTicket);

				await BookEvents.create(bookedTicket);

				userTicketCounts[userId] = (userTicketCounts[userId] || 0) + 1;
				userTotalAmounts[userId] = (userTotalAmounts[userId] || 0) + price;

				const eventIndex = bookedEvents.findIndex(event => event.eventDetails.id === eventId);
				if (eventIndex === -1) {
					const event = await Event.findByPk(eventId);
					if (event) {
						bookedEvents.push({ eventDetails: event.toJSON() });
					}
				}
			}

			// await EventTickets.update(
			// 	{ number_available: eventTickets.number_available - quantity },
			// 	{ where: { id: eventTickets.id } }
			// );
		}

		const totalEventTickets = await EventTickets.sum('number_available', { where: { eventId: eventIds } });
		const eventTicketsData = await EventTickets.findAll({ where: { eventId: eventIds } });
		const bookedPlan = bookings[0].planId;

		// Sending the response
		const response = {
			status: true,
			message: 'Events booked successfully',
			event_status: totalEventTickets === 0 ? 'sold out' : 'available',
			userTicketCounts,
			userTotalAmounts,
			bookingId,
			bookedEvents,
			eventTickets: bookedTickets // Return bookedTickets array directly
		};
		async function generateBarcodeImage(ticketNumber) {
			return new Promise((resolve, reject) => {
				bwipjs.toBuffer({
					bcid: 'code128', // Barcode type
					text: ticketNumber,
					scale: 3, // Scale factor
					height: 10, // Height, in millimeters
					includetext: true, // Include human-readable text
					textxalign: 'center' // Text alignment
				}, function (err, png) {
					if (err) {
						reject(err);
					} else {
						resolve(png);
					}
				});
			});
		}

		// Generate barcode images for each ticket number
		const barcodeImages = await Promise.all(bookedTickets.map(ticket => generateBarcodeImage(ticket.ticketNumber)));

		// Save each barcode image to a file
		const barcodeImagePaths = [];
		for (let i = 0; i < bookedTickets.length; i++) {
			const ticket = bookedTickets[i];
			const barcodeImage = await generateBarcodeImage(ticket.ticketNumber);
			const barcodeImagePath = `barcode_${i}.png`;
			fs.writeFileSync(barcodeImagePath, barcodeImage);
			barcodeImagePaths.push(barcodeImagePath);
		}


		// Save the barcode image to a file
		// fs.writeFileSync(barcodeImagePath, scannerImageBuffer);
		// Sending email
		const mailOptions = {
			from: 'your@example.com',
			to: email,
			subject: 'CoFit App Event Booking Confirmation',
			html: `
			<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f7f7f7; padding: 20px; border-radius: 10px;">
				<div style="background-color: #fff; padding: 10px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					<h1 style="font-size: 28px; font-weight: 600; color: #e25f3c; margin-bottom: 20px; text-align: center;">Event Booking Confirmation</h1>
					<div style="margin-bottom: 20px;">
						<h2 style="font-size: 22px; margin-bottom: 10px; color: #333;">Dear ${firstName} ${lastName},</h2>
						<p style="font-size: 18px; color: #666;">Your event has been successfully booked. Below are the event details:</p>
					</div>
		
					<div style="margin-bottom: 30px;">
						<div style="border: 1px solid #ccc; border-radius: 5px; overflow: hidden;">
							<img src="cid:eventThumbnail" alt="Event Thumbnail" style="width: 100%; display: block; border-bottom: 1px solid #ccc;">
							<div style="padding: 20px;">
							<h2 style="font-size: 24px; margin-bottom: 10px; color: #e25f3c;">Booked Event</h2>
							<h3 style="font-size: 20px; margin-top: 0; color: #333;">${bookedEvents[0].eventDetails.events.title}</h3>
							
							<p style="font-size: 18px; color: #666;">
							  <strong>Date:</strong> 
							  ${bookedEvents[0].eventDetails.events.date?.when ? bookedEvents[0].eventDetails.events.date.when : 'Not specified'}
							</p>
							
							
							
							<p style="font-size: 18px; color: #666;">
							  <strong>Description:</strong> 
							  ${bookedEvents[0].eventDetails.events.description ? bookedEvents[0].eventDetails.events.description : 'Not specified'}
							</p>
							
							<p style="font-size: 18px; color: #666;">
							  <strong>Address:</strong> 
							  ${bookedEvents[0].eventDetails.events.address && bookedEvents[0].eventDetails.events.address.length > 0 ?
					bookedEvents[0].eventDetails.events.address.join(", ") : 'Not specified'}
							</p>
							
							</div>
						</div>
					</div>
		
					<div>
						<h2 style="font-size: 24px; margin-bottom: 10px; color: #e25f3c;">Booked Tickets</h2>
						${bookedTickets.map((ticket, index) => `
							<div style="border: 1px solid #ccc; border-radius: 5px; overflow: hidden; margin-bottom: 20px;">
								<div style="padding: 20px;">
									<h3 style="font-size: 20px; margin-top: 0; color: #333;">Ticket Details</h3>
									<p style="font-size: 18px; color: #666;"><strong>Plan:</strong> ${ticket.planId}</p>
									<p style="font-size: 18px; color: #666;"><strong>Amount:</strong> $${ticket.amount}</p>
									<p style="font-size: 18px; color: #666;"><strong>Quantity:</strong> ${ticket.quantity}</p>
									<p style="font-size: 18px; color: #666;"><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
									<img src="cid:barcode_${index}" alt="Barcode" style="display: block; max-width: 300px;">
								</div>
							</div>
						`).join('')}
					</div>
		
					<p style="font-size: 18px; color: #666; text-align: center;">Thank you for booking with us!</p>
				</div>
			</div>
			`,
			attachments: [
				{
					filename: 'eventThumbnail.png',
					path: bookedEvents[0].eventDetails.events.thumbnail,
					cid: 'eventThumbnail'
				},
				...barcodeImagePaths.map((path, index) => ({
					filename: `barcode_${index}.png`,
					path: path,
					cid: `barcode_${index}`
				}))
			]
		};









		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error('Error occurred while sending email:', error);
			} else {
				console.log('Email sent:', info.response);
			}
		});

		return res.status(201).json(response);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};

// Function to generate a random ticket number
function generateTicketNumber() {
	let ticketNumber = Math.random().toString(36).substring(2, 10).toUpperCase();
	while (ticketNumber.length < 10) {
		ticketNumber += Math.random().toString(36).substring(2, 10).toUpperCase();
	}
	return ticketNumber.substring(0, 10);
}


module.exports.ShareTicket = async (req, res) => {
	try {
		const { ticketNumber } = req.params;

		// Find the booked ticket by ticket number
		const bookedTicket = await BookEvents.findOne({ where: { ticketNumber } });

		if (!bookedTicket) {
			return res.status(404).json({ error: 'Ticket not found' });
		}

		// Find the associated event details
		const event = await Event.findByPk(bookedTicket.eventId);
		if (!event) {
			return res.status(404).json({ error: 'Event not found' });
		}

		// Extract all fields from the event and ticket details
		const eventData = {
			eventName: event.events.title,
			eventImage: event.events.image,
			description: event.events.description,
			date: event.events.date.when,
			address: event.events.address.join(", "),
			plan: bookedTicket.planId,
			amount: bookedTicket.amount,
			quantity: bookedTicket.quantity,
			ticketNumber: bookedTicket.ticketNumber
		};

		// Generate barcode for the ticket number
		const barcodeBuffer = await generateBarcode(ticketNumber);

		// Generate HTML markup
		const htmlMarkup = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Event Ticket</title>
            <style>
			.container {
				justify-content: space-between;
				align-items: center;
				margin: 20px;
				background-color: #fff7f7;
				padding: 20px;
				border-radius: 12px;
				text-align: center;
				box-shadow: 0 0 9px 2px #ede4e4;
				width: fit-content;
			}
                .event-details {
                    flex: 1;
                    margin-left: 20px;
                    line-height: 17px;
					width: 285px;
                }
				.event-image {
					width: 317px;
					border-radius: 10px;
					height: 238px;
					margin-top: 25px;
				}
                .barcode {
                    margin-top: 20px;                   
                    padding: 20px;
                    border-radius: 12px;
                }
				.event-details p{
					word-wrap: break-word;
    				
				}
				.event-ticket {
					display: flex;
					justify-content: center;
				}
            </style>
        </head>
        <body>
		<div class="event-ticket">
            <div class="container">
                <img src="${eventData.eventImage}" alt="Event Image" class="event-image">
                <div class="event-details">
                    <h2>${eventData.eventName}</h2>
                    <p><strong></strong> ${eventData.date}</p>
                    <p><strong></strong> ${eventData.address}</p>
                    
                </div>
            
            
            <div class="barcode">
                    <p>-----------------<strong> Ticket ${eventData.quantity} of ${eventData.quantity}</strong> -----------------</p>
                    <p>${eventData.plan} Ticket</p>
                   
                    <p>Ticket Number ${eventData.ticketNumber}</p>
                <img src="data:image/png;base64,${barcodeBuffer.toString('base64')}" alt="Barcode" width="280px">
				<p>Powered By<strong> COFIT</strong></p>
            </div>
			</div>
			</div>
        </body>
        </html>
        `;

		// Return response with HTML markup and JSON data
		return res.status(200).send(htmlMarkup);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, error: 'Server error' });
	}
};

// Function to generate barcode for the ticket number
async function generateBarcode(ticketNumber) {
	return new Promise((resolve, reject) => {
		bwipjs.toBuffer({
			bcid: 'code128', // Barcode type (code128 for example)
			text: ticketNumber,
			scale: 3, // Adjust scale as needed
			height: 10 // Adjust height as needed
		}, (err, png) => {
			if (err) {
				reject(err);
			} else {
				resolve(png);
			}
		});
	});
}



module.exports.createPromoCode = async (req, res) => {
	try {
		const { code, type, value, status } = req.body;
		const newPromoCode = await PromoCode.create({ code, type, value, status });
		const promoCodeArray = [newPromoCode];
		res.status(201).json({ status: true, promoCodeArray });
	} catch (error) {
		res.status(400).json({ status: false, error: error.message });
	}
};

module.exports.getPromoCode = async (req, res) => {
	try {
		const promoCodes = await PromoCode.findAll();
		res.status(200).json({ status: true, promoCodes });
	} catch (error) {
		res.status(500).json({ status: false, error: error.message });
	}
};

module.exports.manageEvent = async (req, res) => {
	try {
		const eventId = req.params.eventId;

		// Find the event details
		const event = await Event.findByPk(eventId);
		if (!event) {
			return res.status(404).json({ status: false, error: 'Event not found' });
		}

		// Find the event tickets details
		const eventTickets = await EventTickets.findAll({ where: { eventId } });
		if (!eventTickets || eventTickets.length === 0) {
			return res.status(404).json({ status: false, error: 'Event tickets not found' });
		}

		// Find the total number of tickets for the event
		const totalTickets = await EventTickets.sum('number_available', { where: { eventId } });

		// Find the attendees list who booked this event with plans, including name, email, and mobile number
		const attendees = await BookEvents.findAll({
			where: { eventId, paymentStatus: 'paid' }, // Filter by eventId and paymentStatus
			attributes: ['userId', 'firstName', 'lastName', 'email', 'phoneNumber', 'planId', 'quantity'] // Select necessary attributes
		});

		res.json({
			status: true,
			event,
			eventTickets: eventTickets.map(ticket => ticket.toJSON()), // Convert each ticket to JSON
			totalTickets,
			attendees
		});
	} catch (error) {
		return res.status(500).json({ status: false, error: error.message });
	}
};



module.exports.getAllCities = async (req, res) => {
	try {
		const cities = await City.findAll({
			attributes: ['id', 'city']
		});

		res.json({ status: true, cities });
	} catch (error) {
		// Handle errors
		console.error('Error fetching cities:', error);
		res.status(500).json({ status: false, error: 'Internal Server Error' });
	}
};


const _ = require('lodash');
const { CLIENT_RENEG_LIMIT } = require("tls");


// module.exports.getAllTransactionsofcustomer = async (req, res) => {
// 	try {
// 		const userId = req.params.userId; // Extract userId from request parameters

// 		// Fetch distinct payment intents for the given user
// 		const distinctPaymentIntents = await Transactions.count({
// 			distinct: 'payment_intent',
// 			where: {
// 				user_id: userId,
// 				type: 'payment' // Assuming 'payment' is the type for payment transactions
// 			}
// 		});

// 		if (!distinctPaymentIntents || distinctPaymentIntents === 0) {
// 			return res.status(404).json({ status: false, message: 'No transactions found' });
// 		}

// 		// Fetch payment transactions for the given user
// 		const paymentTransactions = await Transactions.findAll({
// 			where: {
// 				user_id: userId,
// 				type: 'payment' // Assuming 'payment' is the type for payment transactions
// 			}
// 		});

// 		// Filter payment transactions based on unique payment intents
// 		const uniquePaymentIntents = new Set();
// 		const uniquePaymentTransactions = [];
// 		for (const transaction of paymentTransactions) {
// 			if (!uniquePaymentIntents.has(transaction.payment_intent)) {
// 				uniquePaymentTransactions.push(transaction);
// 				uniquePaymentIntents.add(transaction.payment_intent);
// 				if (uniquePaymentIntents.size === distinctPaymentIntents) {
// 					break; // Stop when all unique payment intents are found
// 				}
// 			}
// 		}

// 		// Fetch transfer transactions for the given user
// 		const transferTransactions = await Transactions.findAll({
// 			distinct: 'payment_intent',
// 			where: {
// 				user_id: userId,
// 				type: 'transfer' // Assuming 'transfer' is the type for transfer transactions
// 			}
// 		});

// 		// Combine both types of transactions
// 		const allTransactions = [...uniquePaymentTransactions, ...transferTransactions];

// 		if (!allTransactions || allTransactions.length === 0) {
// 			return res.status(404).json({ status: false, message: 'No transactions found' });
// 		}

// 		// Initialize array to store transaction details
// 		const transactionDetails = [];

// 		// Iterate through all transactions
// 		for (const transaction of allTransactions) {
// 			const { payment_intent, payoutAmount, type, createdAt, amount } = transaction;

// 			// Use the correct amount based on the transaction type
// 			let transactionAmount;
// 			if (type == 'payment') {
// 				transactionAmount = transaction.amount;
// 			} else {
// 				transactionAmount = transaction.payoutAmount;
// 			}

// 			// Fetch booked events associated with this transaction
// 			const bookedEvents = await BookEvents.findAll({
// 				where: {
// 					[Op.and]: [
// 						{
// 							[Op.or]: [
// 								{ transactionId: payment_intent },
// 								{ userId: userId }
// 							]
// 						},
// 						{ paymentStatus: 'paid' } // Adding condition for payment status
// 					]
// 				},
// 			});

// 			// If no booked events found, continue to the next transaction
// 			if (!bookedEvents || bookedEvents.length === 0) {
// 				continue;
// 			}

// 			// Group booked events by eventId and userId
// 			const groupedBookedEvents = _.groupBy(bookedEvents, event => `${event.eventId}-${event.userId}`);

// 			// Iterate through grouped booked events
// 			for (const key in groupedBookedEvents) {
// 				if (Object.hasOwnProperty.call(groupedBookedEvents, key)) {
// 					const [eventId, userId] = key.split('-');
// 					const events = groupedBookedEvents[key];

// 					// Fetch event details associated with the booked event
// 					const eventDetail = await Event.findOne({
// 						where: { id: eventId }
// 					});

// 					if (eventDetail) {
// 						// Construct transaction detail object
// 						const transactionDetail = {
// 							userId,
// 							amount: transactionAmount, // This is the correct amount based on transaction type
// 							type,
// 							eventName: eventDetail.events.title,
// 							eventDate: eventDetail.events.date.when,
// 							eventLocation: eventDetail.events.address[0],
// 							eventImage: eventDetail.events.thumbnail,
// 							tickets: events.map(bookedEvent => ({
// 								id: bookedEvent.ticketNumber,
// 								planName: bookedEvent.planId,
// 								price: bookedEvent.amount, // Using booked event's amount as price
// 								quantity: bookedEvent.quantity
// 							})),
// 							createdAt,
// 						};

// 						// Push transaction detail into the array
// 						transactionDetails.push(transactionDetail);
// 					}
// 				}
// 			}
// 		}

// 		function keepFirstOccurrenceByUserIdAndAmount(data) {
// 			const uniqueTransactions = {};
// 			const filteredData = [];

// 			for (const transaction of data) {
// 				const key = `${userId}_${transaction.amount}`;
// 				console.log('transaction.userId', transaction.userId)
// 				if (!uniqueTransactions.hasOwnProperty(key)) {
// 					uniqueTransactions[key] = true;
// 					filteredData.push(transaction);
// 				}
// 			}

// 			return filteredData;
// 		}

// 		// Example usage:
// 		const filteredTransactions = keepFirstOccurrenceByUserIdAndAmount(transactionDetails);
// 		console.log(filteredTransactions);



// 		return res.status(200).json({ status: true, transactionCount: distinctPaymentIntents, transactionDetails: filteredTransactions });

// 	} catch (error) {
// 		console.error(error);
// 		return res.status(500).json({ status: false, error: 'Internal server error' });
// 	}
// };

module.exports.getAllTransactionsofcustomer = async (req, res) => {
	try {
		const userId = req.params.userId; // Assuming userId is passed in the request parameters

		// Fetch transactions
		const transactions = await Transactions.findAll({
			where: {
				user_id: userId
			}
		});

		// Extract payment intents from transactions
		const paymentIntents = transactions.map(transaction => transaction.payment_intent);

		// Fetch BookEvents where transactionId matches payment intents
		const bookEvents = await BookEvents.findAll({
			where: {
				transactionId: paymentIntents
			}
		});
		const eventIds = bookEvents.map(event => event.eventId);

		// Fetch event details from Event table based on eventIds
		const eventDetails = await Event.findAll({
			where: {
				id: eventIds
			}
		});

		// Fetch event ticket details based on eventIds
		const eventTicketDetails = await EventTickets.findAll({
			where: {
				eventId: eventIds
			}
		});

		// Prepare the response in the desired format
		const transactionDetails = transactions.map(transaction => {
			// Find associated book events for the transaction
			const associatedBookEvents = bookEvents.filter(event => event.transactionId === transaction.payment_intent);

			// Find associated event details for the book events
			const associatedEventDetails = eventDetails.find(event => event.id === associatedBookEvents[0].eventId);

			// Find associated event ticket details for the event
			const associatedEventTicketDetails = eventTicketDetails.filter(ticket => ticket.eventId === associatedEventDetails.id);

			// Construct tickets array
			const tickets = associatedBookEvents.map(event => {
				const eventTicket = associatedEventTicketDetails.find(ticket => ticket.eventId === event.eventId);
				return {
					id: event.ticketNumber,
					planName: event.planId,
					price: eventTicket ? eventTicket.price : null,
					quantity: event.quantity
				};
			});
			let amount = transaction.amount;
			if (transaction.type === "transfer") {
				// Set amount to a default value or null if appropriate
				amount = transaction.payoutAmount; // or assign a default value if necessary
			}
			return {
				userId: transaction.user_id,
				amount,
				type: transaction.type,
				eventId: associatedEventDetails.id,
				eventName: associatedEventDetails.events.title,
				eventDate: associatedEventDetails.events.date.when,
				eventLocation: associatedEventDetails.events.address[0],
				eventImage: associatedEventDetails.events.image,
				tickets,
				createdAt: transaction.createdAt
			};
		});

		// Respond with the transformed data
		res.json({ status: true, transactionCount: transactions.length, transactionDetails });
	} catch (error) {
		// Handle errors
		console.error('Error fetching transactions and book events:', error);
		res.status(500).json({ status: false, error: 'Internal Server Error' });
	}
};


module.exports.signup = async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if the email already exists
		const existingUser = await NewUser.findOne({ where: { email } });
		if (existingUser) {
			return res.status(400).json({ status: false, message: 'Email already exists' });
		}

		// Generate a salt to hash the password
		const salt = await bcrypt.genSalt(10);
		// Hash the password with the salt
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create a new user with hashed password
		const newUser = await NewUser.create({ email, password: hashedPassword });

		// Respond with the email, ID, and status
		res.status(201).json({
			status: true,
			id: newUser.id, // Assuming your model has an 'id' attribute
			email: newUser.email,
			message: 'User created successfully'
		});
	} catch (error) {
		console.error('Error creating user:', error);
		res.status(500).json({ status: false, error: 'Failed to create user' });
	}
};

const client = new OAuth2Client(googleClientId);

// module.exports.socialLogin = async (req, res) => {
//     const { provider, access_token, email } = req.body;

//     try {
//         let user;

//         if (provider === 'google') {
//             // Google Login - Commented out verification for testing in Postman
//             try {
//                 const ticket = await client.verifyIdToken({
//                     idToken: access_token,
//                     audience: googleClientId,
//                 });
//                 const payload = ticket.getPayload();
//                 const googleId = payload.sub; // Extract Google ID (sub) from token payload

//                 // Check if the user exists
//                 user = await NewUser.findOne({ where: { email } });

//                 if (!user) {
//                     // Create a new user if not exists
//                     user = await NewUser.create({ email, googleuser: googleId });
//                 } else {
//                     // Update existing user with Google ID
//                     user.googleuser = googleId;
//                     await user.save();
//                 }

//             } catch (error) {
//                 console.error('Error with Google login:', error);
//                 return res.status(500).json({ status: false, message: 'Failed to authenticate with Google' });
//             }

//         } else if (provider === 'facebook') {
//             // Facebook Login - Commented out token verification for testing in Postman
//             try {
//                 const response = await axios.get(`https://graph.facebook.com/v14.0/me?fields=email&access_token=${access_token}`);
//                 const facebookUserId = response.data.id;

//                 // Check if the user exists
//                 user = await NewUser.findOne({ where: { email } });

//                 if (!user) {
//                     // Create a new user if not exists
//                     user = await NewUser.create({ email, facebookuser: facebookUserId });
//                 } else {
//                     // Update existing user with Facebook ID
//                     user.facebookuser = facebookUserId;
//                     await user.save();
//                 }

//             } catch (error) {
//                 console.error('Error with Facebook login:', error);
//                 return res.status(500).json({ status: false, message: 'Failed to authenticate with Facebook' });
//             }

//         } else if (provider === 'apple') {
//             // Apple Login - Assuming you have a way to extract Apple user ID from identityToken
//             try {
//                 const { identityToken } = req.body;
//                 const appleUserId = 'extract apple user id from token'; // Replace with your logic to extract Apple user ID

//                 // Check if the user exists
//                 user = await NewUser.findOne({ where: { email } });

//                 if (!user) {
//                     // Create a new user if not exists
//                     user = await NewUser.create({ email, appleuser: appleUserId });
//                 } else {
//                     // Update existing user with Apple ID
//                     user.appleuser = appleUserId;
//                     await user.save();
//                 }

//             } catch (error) {
//                 console.error('Error with Apple login:', error);
//                 return res.status(500).json({ status: false, message: 'Failed to authenticate with Apple' });
//             }

//         } else {
//             return res.status(400).json({ status: false, message: 'Invalid provider or missing credentials' });
//         }

//         // Respond with user details
//         res.status(200).json({
//             status: true,
//             id: user.id,
//             email: user.email,
//             message: 'User logged in successfully',
//         });

//     } catch (error) {
//         console.error(`Error with ${provider} login:`, error);
//         res.status(500).json({ status: false, error: `Failed to authenticate with ${provider}` });
//     }
// };

// async function sendWelcomeEmail(email, token) {
// 	try {
// 		// Generate URL for password set endpoint
// 		const setPasswordUrl = `https://your-app.com/set-password?token=${token}`;

// 		// Send email logic
// 		const mailOptions = {
// 			from: 'your-email@example.com',
// 			to: email,
// 			subject: 'Welcome to Our App! Set Your Password',
// 			html: `
//                 <p>Thank you for signing up. Please click <a href="${setPasswordUrl}">here</a> to set your password.</p>
//                 <p>This link will expire in 1 hour for security reasons.</p>
//             `,
// 		};

// 		await transporter.sendMail(mailOptions);
// 		console.log(`Welcome email sent to ${email}`);
// 	} catch (error) {
// 		console.error('Error sending welcome email:', error);
// 		// Handle error sending email
// 	}
// }

// // Replace this with your secure token generation logic
// function generateSecureToken() {
// 	return Math.random().toString(36).substr(2, 10); // Example: Generate a random token
// }


// module.exports.updatePassword = async (req, res) => {
// 	const { id, password } = req.body;

// 	try {
// 		// Find user by id
// 		const user = await NewUser.findByPk(id);

// 		if (!user) {
// 			return res.status(400).json({ status: false, error: 'User not found' });
// 		}

// 		// Update user's password and profile
// 		const salt = await bcrypt.genSalt(10);
// 		const hashedPassword = await bcrypt.hash(password, salt);

// 		user.password = hashedPassword;

// 		await user.save();
// 		window.location.href = 'UpdatePassword.html'
// 		// Respond with success message
// 		res.status(200).json({ status: true, message: 'Password updated successfully' });
// 	} catch (error) {
// 		console.error('Error updating password:', error);
// 		res.status(500).json({ status: false, error: 'Failed to update password' });
// 	}
// };





// Google Login
module.exports.googleLogin = async (req, res) => {
	const { access_token, email, googleId, useNewClientId = true } = req.body;

	try {
		// Determine which client ID to use
		const clientIdToUse = useNewClientId ? googleClientIdNew : googleClientId;

		const ticket = await client.verifyIdToken({
			idToken: access_token,
			audience: clientIdToUse,
		});
		// const payload = ticket.getPayload();
		// const googleId = payload.sub; // Extract Google ID (sub) from token payload

		let user = await NewUser.findOne({ where: { email } });

		if (!user) {
			// Create new user if not found
			user = await NewUser.create({ email, googleuser: googleId, newUser: true });
		} else {
			// Update existing user with googleId and set newUser to false
			user.googleuser = googleId;
			user.newUser = false; // Existing user, so set newUser to false
			await user.save();
		}

		// Fetch user again to ensure all fields are populated
		user = await NewUser.findOne({ where: { email } });

		const userData = {
			id: user.id,
			email: user.email,
			first_name: user.firstName,
			last_name: user.lastName,
			dob: user.dob,
			gender: user.gender,
			phone_no: user.phoneNo,
			profile_image: user.profilePhoto,
			interests: user.interests,
			location: user.homeLocation,
			search_location: user.searchLocation,
			googleuser: user.googleuser,
			facebookuser: user.facebookuser,
			appleuser: user.appleuser,
		};

		res.status(200).json({
			status: true,
			user: userData,
			newUser: user.newUser,
			message: 'User logged in successfully with Google',
		});

	} catch (error) {
		console.error('Error with Google login:', error);
		res.status(500).json({ status: false, message: 'Token Expired' });
	}
};



// Facebook Login
module.exports.facebookLogin = async (req, res) => {
	const { access_token, email, facebookId } = req.body;

	try {
		// You need to implement how to verify the Facebook access token
		// This could involve making a request to Facebook API or using a library
		// For simplicity, let's assume you have a method to verify the token similar to Google

		// Example of verifying Facebook token (this needs to be implemented)
		const isValid = await verifyFacebookToken(access_token, facebookClientId);

		// For now, let's assume token is valid
		// const isValid = true; // Replace this with actual token verification

		if (!isValid) {
			return res.status(401).json({ status: false, message: 'Invalid Facebook token' });
		}

		let user = await NewUser.findOne({ email });

		if (!user) {
			// Create new user if not found
			user = await NewUser.create({ email, facebookuser: facebookId, newUser: true });
		} else {
			// Update existing user with facebookId and set newUser to false
			user.facebookuser = facebookId;
			user.newUser = false; // Existing user, so set newUser to false
			await user.save();
		}

		// Fetch user again to ensure all fields are populated
		user = await NewUser.findOne({ email });

		const userData = {
			id: user.id,
			email: user.email,
			first_name: user.firstName,
			last_name: user.lastName,
			dob: user.dob,
			gender: user.gender,
			phone_no: user.phoneNo,
			profile_image: user.profilePhoto,
			interests: user.interests,
			location: user.homeLocation,
			search_location: user.searchLocation,
			googleuser: user.googleuser,
			facebookuser: user.facebookuser,
			appleuser: user.appleuser,
		};

		res.status(200).json({
			status: true,
			user: userData,
			newUser: user.newUser,
			message: 'User logged in successfully with Facebook',
		});

	} catch (error) {
		console.error('Error with Facebook login:', error);
		res.status(500).json({ status: false, message: 'Internal Server Error' });
	}
};

// Apple Login
module.exports.appleLogin = async (req, res) => {
	const { email, appleId } = req.body;

	try {
		// Check if Apple ID exists in the database
		let user = await NewUser.findOne({ where: { appleuser: appleId } });

		if (!user) {
			// Apple ID not found, check if email exists
			if (email) {
				user = await NewUser.findOne({ where: { email } });
				if (user) {
					// Update existing user with Apple ID
					user.appleuser = appleId;
					user.newUser = false; // Existing user, so set newUser to false
					await user.save();
				} else {
					// Create new user with both email and Apple ID
					user = await NewUser.create({ email, appleuser: appleId, newUser: true });
				}
			} else {
				// No email provided, create new user with only Apple ID
				user = await NewUser.create({ appleuser: appleId, newUser: true });
			}
		} else {
			// Apple ID found
			if (!user.email && email) {
				// If existing user's email is not set and email is provided, update email
				user.email = email;
			}
			// Ensure newUser flag is set to false if user is found
			user.newUser = false;
			await user.save();
		}

		// Fetch user again to ensure all fields are populated
		user = await NewUser.findOne({ where: { appleuser: appleId } });

		const userData = {
			id: user.id,
			email: user.email,
			first_name: user.firstName,
			last_name: user.lastName,
			dob: user.dob,
			gender: user.gender,
			phone_no: user.phoneNo,
			profile_image: user.profilePhoto,
			interests: user.interests,
			location: user.homeLocation,
			search_location: user.searchLocation,
			googleuser: user.googleuser,
			facebookuser: user.facebookuser,
			appleuser: user.appleuser,
		};

		res.status(200).json({
			status: true,
			user: userData,
			newUser: user.newUser,
			message: 'User logged in successfully',
		});

	} catch (error) {
		console.error('Error with Apple login:', error);
		res.status(500).json({ status: false, message: 'Failed to log in with Apple' });
	}
};


module.exports.updatePassword = async (req, res) => {
	const userId = parseInt(req.params.id);
	const { newPassword } = req.body;

	try {
		// Find the user by ID
		let user = await NewUser.findOne({ where: { id: userId } });

		if (!user) {
			return res.status(404).json({ status: false, message: 'User not found' });
		}

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update user's password in the database
		user.password = hashedPassword;
		await user.save(); // Save the updated user

		// Respond with success message
		res.json({ status: true, message: 'Password updated successfully' });
	} catch (error) {
		console.error('Error updating password:', error);
		res.status(500).json({ status: false, message: 'Failed to update password' });
	}
};


module.exports.login = async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if the user exists with the provided email
		let user = await NewUser.findOne({ where: { email } });

		if (!user) {
			return res.status(404).json({ status: false, message: 'Email or Password is incorrect' });
		}

		// Compare the provided password with the hashed password stored in the database
		const isPasswordMatch = await bcrypt.compare(password, user.password);
		if (!isPasswordMatch) {
			return res.status(401).json({ status: false, message: 'Invalid password' });
		}

		// Prepare user data to send in response
		const userData = {
			id: user.id,
			email: user.email,
			first_name: user.firstName,
			last_name: user.lastName,
			dob: user.dob,
			gender: user.gender,
			phone_no: user.phoneNo,
			profile_image: user.profilePhoto,
			interests: user.interests,
			location: user.homeLocation,
			search_location: user.searchLocation,
			googleuser: user.googleuser,
			facebookuser: user.facebookuser,
			appleuser: user.appleuser,
		};

		// User is authenticated
		res.status(200).json({
			status: true,
			user: userData,
			message: 'Login successful'
		});
	} catch (error) {
		console.error('Error logging in user:', error);
		res.status(500).json({ status: false, message: 'Incorrect Password' });
	}
};


module.exports.SendResetLink = async (req, res) => {
	const { email } = req.body; // Assuming the request body contains user's email

	try {
		const user = await NewUser.findOne({ where: { email } });

		if (!user) {
			return res.status(404).json({ status: false, message: 'User not found' });
		}

		// Continue with sending reset link logic
		const resetLink = `https://cofitapp.com/reset-password?id=${encodeURIComponent(user.id)}`;
		const mailOptions = {
			from: '"CoFit App" <support@cofitapp.com>',
			to: user.email,
			subject: 'Password Reset',
			// HTML body with a clickable link
			html: `
				<p style="color: black; font-weight: 600;">Dear User,</p>
				<p>We received a request to reset your password for Cofit App. To proceed with resetting your password, please follow the instructions below:</p>
				<ol>
					<li>Click the following link to reset your password:</li>
					<p><a href="${resetLink}" target="_blank" style="color: blue; text-decoration: underline;">Reset Your Password</a></p>
				</ol>
				<p><strong>Note:</strong> This link will expire after 24 hours. If you do not reset your password within this time, you may need to request another password reset.</p>
				<p>If you did not request this password reset, please ignore this email. Your account security is important to us, and no changes have been made to your account at this time.</p>
				<p>Thank you for using Cofit App. If you have any questions or need further assistance, please don’t hesitate to contact our support team at <a href="mailto:support@cofitapp.com">support@cofitapp.com</a>.</p>
				<p style="color: black; font-weight: 600;">Best Regards,<br/>Cofit Corp</p>
			`
		};

		// Send the email
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error('Error sending email:', error);
				return res.status(500).json({ status: false, message: 'Error sending email' });
			}
			console.log('Email sent:', info.response);
			res.status(200).json({ status: true, message: 'Reset instructions sent successfully' });
		});

	} catch (error) {
		console.error('Error finding user:', error);
		res.status(500).json({ status: false, message: 'Error finding user' });
	}
};


module.exports.resetPassword = async (req, res) => {
	const { email, newPassword } = req.body;

	try {
		// Find user by email
		const user = await NewUser.findOne({ where: { email } });

		if (!user) {
			return res.status(404).json({ status: false, message: 'User not found' });
		}

		// Hash the new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Update user's password with the hashed password
		user.password = hashedPassword;

		// Save the updated user object to persist the new hashed password
		await user.save();

		res.status(200).json({ status: true, message: 'Password reset successfully' });
	} catch (error) {
		console.error('Error resetting password:', error);
		res.status(500).json({ status: false, message: 'Error resetting password' });
	}
};


module.exports.Terms = async (req, res) => {
    // Example Terms of Service HTML content
    const termsOfService = `
    <html>
    <head>
        <title>CoFit Terms of Service</title>
    </head>
    <body>
        <p>Welcome to CoFit! As a platform dedicated to connecting event organizers and participants, we aim to ensure a seamless and safe experience for all users. Please read these Terms of Service (“Terms”) carefully, as they outline your legal rights and obligations when using CoFit’s services.</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using CoFit’s services, you agree to comply with and be bound by these Terms, which also incorporate our Privacy Policy. If you do not agree with any part of these Terms, please do not use our services.</p>

        <h2>2. Description of Services</h2>
        <p>CoFit provides a digital platform for event organizers (“Organizers”) to create, manage, and promote their events, and for consumers (“Attendees”) to discover and register for these events.</p>

        <h2>3. User Accounts</h2>

        <p><strong>3.1 Account Creation:</strong> To access certain features, you must create an account with accurate and complete information.</p>
        <p><strong>3.2 Account Responsibility:</strong> You are responsible for all activities under your account and for keeping your account password secure.</p>
        <p><strong>3.3 Age Restriction:</strong> Users must be at least 18 years old or the age of majority in their jurisdiction, whichever is higher.</p>

        <h2>4. User Conduct</h2>

        <p><strong>4.1 Compliance:</strong> You agree to comply with all applicable laws and regulations in connection with your use of CoFit’s services.</p>
        <p><strong>4.2 Prohibited Activities:</strong> Users shall not engage in any activities that are harmful, fraudulent, deceptive, or offensive.</p>

        <h2>5. Content and Intellectual Property</h2>

        <p><strong>5.1 User Content:</strong> Users may post content (e.g., event information, comments). You represent that you have the right to post such content and that it does not violate any law or third-party rights.</p>
        <p><strong>5.2 CoFit’s Rights:</strong> CoFit reserves the right to remove or modify user content for any reason, including content that we believe violates these Terms.</p>

        <h2>6. Privacy</h2>
        <p>Your privacy is important to us. CoFit’s collection, use, and disclosure of personal information are outlined in our Privacy Policy.</p>

        <h2>7. Disclaimers</h2>
        <p>CoFit provides its services on an “as is” and “as available” basis. We do not warrant that the services will be uninterrupted, timely, secure, or error-free.</p>

        <h2>8. Limitation of Liability</h2>
        <p>To the fullest extent permitted by applicable law, CoFit shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the services.</p>

        <h2>9. Indemnification</h2>
        <p>You agree to indemnify and hold harmless CoFit and its officers, directors, employees, and agents from any claims, damages, liabilities, costs, and expenses (including attorney’s fees) arising from your use of the services or your violation of these Terms.</p>

        <h2>10. Modification of Terms</h2>
        <p>CoFit reserves the right to modify these Terms at any time. Your continued use of the services after any such change constitutes your acceptance of the new Terms.</p>

        <h2>11. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of the United States and the state in which CoFit is headquartered, without regard to its conflict of law provisions.</p>

        <h2>12. Dispute Resolution</h2>
        <p>Any disputes arising from these Terms will be resolved through final and binding arbitration, except as otherwise stated in these Terms.</p>

        <h2>13. Contact Us</h2>
        <p>For any questions about these Terms, please contact us at <a href="info@cofit.com">info@cofit.com</a>.</p>
    </body>
    </html>
    `;

    // Set Content-Type header to indicate JSON response
    const cleanHtml = termsOfService.replace(/\n/g, '');

    res.json({
        status: true,
        data: cleanHtml
    });
};




module.exports.PrivacyPolicy = async (req, res) => {
    const privacyPolicyContent = `
 <html>
    <head>
    </head>
    <body>
    <p>CoFit Privacy Policy</p>

    <p>Last Updated: 1/22/2024</p>

    <p>Welcome to CoFit! Protecting your privacy is critically important to us. This Privacy Policy explains how CoFit, Inc. (“CoFit”, “we”, “us”, “our”) collects, uses, shares, and safeguards your personal information when you use our website, services, and mobile application (collectively, “Services”).</p>

    <h2>1. Information Collection</h2>
    <p>By accessing or using CoFit’s services, you agree to comply with and be bound by these Terms, which also incorporate our Privacy Policy. If you do not agree with any part of these Terms, please do not use our services.</p>

    <h2>2. Use of Information</h2>

    <h3>2.1 Providing Services</h3>
    <p>We use your information to operate, maintain, and provide the features of our Services.</p>
    <h3>2.2 Communication</h3>
    <p>We may use your information to communicate with you, such as to send updates about events or respond to inquiries.</p>
    <h3>2.3 Improvements</h3>
    <p>We use the information to understand how our Services are used and to improve them.</p>

    <h2>3. Sharing of Information</h2>

    <h3>3.1 Service Providers</h3>
    <p>We may share your information with third-party vendors who assist us in operating our Services, such as payment processors or hosting services.</p>
    <h3>3.2 Compliance and Protection</h3>
    <p>We may disclose your information if required by law or if we believe that such action is necessary to comply with legal processes or to protect the rights, property, or safety of CoFit, our users, or others.</p>

    <h2>4. Data Security</h2>
    <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>

    <h2>5. Your Choices</h2>

    <h3>5.1 Account Information</h3>
    <p>You may update, correct, or delete your account information at any time.</p>
    <h3>5.2 Cookies</h3>
    <p>You can set your browser to not accept cookies, but this may limit your ability to use certain features of our Services.</p>

    <h2>6. Children’s Privacy</h2>
    <p>Our Services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13.</p>

    <h2>7. Changes to This Privacy Policy</h2>
    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

    <h2>8. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us at <a href="info@cofit.com">info@cofit.com</a>.</p>

</body>
</html>
`;

    // Remove "\n" characters from the HTML content
    const cleanHtml = privacyPolicyContent.replace(/\n/g, '');

    res.json({
        status: true,
        data: cleanHtml
    });
};




async function fetchAndSaveAddresses() {
	try {
		const events = await Event.findAll();

		let totalCount = 0;

		for (let event of events) {
			const { id, addresses } = event.dataValues;

			if (addresses && addresses.length > 0) {
				for (let address of addresses) {
					const existingAddress = await EventAddress.findOne({
						where: {
							eventId: id,
							address: address,
						}
					});

					if (!existingAddress) {
						await EventAddress.create({
							eventId: id,
							address: address,
						});
						totalCount++;
					}
				}
			}
		}

		console.log(`Processed and saved ${totalCount} addresses successfully.`);
	} catch (error) {
		console.error("Error fetching and saving addresses:", error);
	}
}

// Cron job to run every 2 minutes
// cron.schedule("*/2 * * * *", async () => {
// 	console.log("Running cron job to fetch and save addresses...");
// 	await fetchAndSaveAddresses();
// }); 


// Configure Multer for file uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads'); // specify your upload directory
	},
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}-${file.originalname}`);
	}
});

const upload = multer({
	storage: storage,
	fileFilter: function (req, file, cb) {
		const filetypes = /jpeg|jpg|png/;
		const mimetype = filetypes.test(file.mimetype);
		const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

		if (mimetype && extname) {
			return cb(null, true);
		}
		cb(new Error('Only images are allowed'));
	}
});

// Handle profile photo upload and form data
module.exports.addProfile = [
	upload.single('profilePhoto'), // handle single file upload with field name 'profilePhoto'
	async (req, res) => {
		const userId = req.params.id;

		try {
			let user = await NewUser.findByPk(userId);

			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'User not found'
				});
			}
			let inters = req.body.interests;
			if (typeof req.body.interests === "string") {
				// if(!Array.isArray(inters)){
				// 	inters = [req.body.interests];
				// }
				inters = JSON.parse(req.body.interests);
			}
			console.log({ inters })
			// Ensure fields are in correct format before updating
			const updateFields = {
				firstName: req.body.firstName !== undefined ? req.body.firstName.toString() : user.firstName,
				lastName: req.body.lastName !== undefined ? req.body.lastName.toString() : user.lastName,
				dob: req.body.dob !== undefined ? new Date(req.body.dob) : user.dob,
				gender: req.body.gender !== undefined ? req.body.gender.toString() : user.gender,
				phoneNo: req.body.phoneNo !== undefined ? req.body.phoneNo.toString() : user.phoneNo,
				interests: inters && Array.isArray(inters) ? inters : user.interests,
				homeLocation: req.body.homeLocation !== undefined ? req.body.homeLocation.toString() : user.homeLocation,
				searchLocation: req.body.searchLocation !== undefined ? req.body.searchLocation.toString() : user.searchLocation,
			};
			console.log(updateFields, { updateFields: typeof updateFields.interests }, "updateFields,", Array.isArray(updateFields.interests))

			// If a profile photo was uploaded, update the profile photo field
			if (req.file) {
				const imageUrl = `https://cofitapp.com/${req.file.path}`;
				updateFields.profilePhoto = imageUrl; // Store the file URL in the database
			}
			if (req.body.gender !== undefined) {
				updateFields.gender = req.body.gender.toString();
			}
			// Update user record
			await user.update(updateFields);
			const formattedDob = user.dob ? user.dob.toISOString().split('T')[0] : null;

			// Return success response
			res.status(200).json({
				status: true,
				message: 'Profile updated successfully',
				user: {
					id: user.id,
					email: user.email,
					first_name: user.firstName,
					last_name: user.lastName,
					dob: formattedDob,
					gender: user.gender,
					phone_no: user.phoneNo,
					profile_image: user.profilePhoto,
					interests: inters,
					location: user.homeLocation,
					search_location: user.searchLocation
				}
			});
		} catch (error) {
			console.error('Error adding/updating profile:', error);
			res.status(500).json({
				status: false,
				message: 'Failed to add/update profile'
			});
		}
	}
];




// const endpointSecret = 'whsec_ce4MQk3FuWftxkk5WN244mWIm8CrqrSl';
// const bodyParser = require('body-parser'); // Import body-parser middleware

// module.exports.stripeWebHook = async (req, res) => {
//     // Configure body-parser middleware to parse raw payloads
//     const rawBodyBuffer = (req, res, buf, encoding) => {
//         if (buf && buf.length) {
//             req.rawBody = buf.toString(encoding || 'utf8');
//         }
//     };
//     bodyParser.raw({ verify: rawBodyBuffer, type: '*/*' })(req, res, () => {
//         const payload = req.rawBody;
//         const signature = req.headers['stripe-signature'];

//         // Check if the stripe-signature header exists
//         if (!signature) {
//             return res.status(400).send('Webhook Error: Missing stripe-signature header');
//         }

//         let event;

//         try {
//             event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
//         } catch (err) {
//             // Invalid payload or signature
//             console.error(err.message);
//             return res.status(400).send(`Webhook Error: ${err.message}`);
//         }

//         console.log("Received event:", event.type);
//         // Handle the event
//         switch (event.type) {
//             case 'payment_intent.succeeded':
//                 console.log('Payment succeeded:', event.data.object);
//                 break;
//             case 'payment_intent.payment_failed':
//                 console.log('Payment failed:', event.data.object);
//                 break;
//             case 'transfer.created':
//                 console.log('Transfer created:', event.data);
//                 break;
//             case 'transfer.updated':
//                 console.log('Transfer updated:', event.data);
//                 break;
//             default:
//                 console.log(`Unhandled event type: ${event.type}`);
//         }

//         res.json({ received: true });
//     });
// };

module.exports.stripeWebHook = async (req, res) => {
	const event = req.body;

	switch (event.type) {
		case 'payment_intent.succeeded':
			const paymentIntent = event.data.object;

			try {
				// Get the booked event
				const bookedEvent = await BookEvents.findOne({ where: { transactionId: paymentIntent.id } });
				console.log("bookedEvent", bookedEvent);
				const bookedUserId = bookedEvent.userId;
				console.log("bookedUserId", bookedUserId);
				if (bookedEvent) {
					await BookEvents.update({ paymentStatus: 'paid' }, { where: { transactionId: paymentIntent.id } });
					// Get event details
					const eventDetails = await Event.findByPk(bookedEvent.eventId);

					if (eventDetails) {
						// Transfer payment to the user who created the event
						const creatorUserId = eventDetails.user_id;

						const transactions = [{
							stripe_charge_id: paymentIntent.id,
							amount: paymentIntent.amount,
							currency: paymentIntent.currency,
							captured: true,
							payment_intent: paymentIntent.id,
							payment_method: paymentIntent.payment_method,
							customer: paymentIntent.customer,
							description: paymentIntent.description,
							status: 'succeeded',
							receipt_url: paymentIntent.charges.data[0].receipt_url,
							created: new Date(paymentIntent.created * 1000),
							eventId: bookedEvent.dataValues.eventId,
							type: 'payment',
							user_id: bookedEvent?.userId || null,
							payoutAmount: paymentIntent.transfer_data && paymentIntent.transfer_data.amount,
							stripeAccountId: paymentIntent.transfer_data && paymentIntent.transfer_data.destination
						}, {
							stripe_charge_id: null,
							amount: null,
							currency: paymentIntent.currency,
							captured: true,
							payment_intent: paymentIntent.id,
							payment_method: null,
							customer: null,
							description: null,
							status: 'succeeded',
							receipt_url: null,
							created: new Date(paymentIntent.created * 1000),
							eventId: bookedEvent.dataValues.eventId,
							type: 'transfer',
							user_id: creatorUserId,
							payoutAmount: paymentIntent.transfer_data && paymentIntent.transfer_data.amount,
							stripeAccountId: paymentIntent.transfer_data && paymentIntent.transfer_data.destination
						}];

						// Bulk insert transactions
						await Transactions.bulkCreate(transactions);
						console.log('Transaction details saved successfully.');

						// Update EventTickets
						// Update EventTickets
						const eventTickets = await EventTickets.findOne({ where: { eventId: bookedEvent.eventId } });
						if (eventTickets) {
							await EventTickets.update(
								{ number_available: eventTickets.number_available - bookedEvent.quantity }, // Subtract booked quantity
								{ where: { id: eventTickets.id } }
							);
							console.log('EventTickets updated successfully.');
						}

					}
				}
			} catch (error) {
				console.error('Error saving transaction details:', error);
				return res.status(500).json({ error: 'Failed to save transaction details.' });
			}
			break;
		case 'transfer.created':
			// Handle transfer creation event
			break;
		case 'charge.succeeded':
			// Handle charge succeeded event
			break;
		case 'charge.failed':
			// Handle charge failed event
			break;
		case 'transfer.updated':
			// Handle transfer updated event
			break;
		default:
			console.log(`Unhandled event type: ${event.type}`);
	}

	res.status(200).end();
};





module.exports.RetriveStripeAccount = async (req, res) => {
	try {
		const account = await stripe.accounts.retrieve(req.params.accountId);

		res.json({ status: true, account });
	} catch (error) {
		res.status(500).json({ status: false, error: error.message });
	}
};


// module.exports.BookedEventsListing = async (req, res) => {
//     try {
//         const { userId } = req.params; // Only userId is required

//         if (!userId) {
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         const bookedEvents = await BookEvents.findAll({ where: { userId }, order: [['createdAt', 'DESC']] }); 
// 		console.log("BookEvents", BookEvents)

//         if (!bookedEvents || bookedEvents.length === 0) {
//             return res.status(404).json({ message: 'No booked events found for the user ID' });
//         }
//         const eventMap = new Map();

//         for (const booking of bookedEvents) {
//             const event = await Event.findByPk(booking.eventId);

//             if (event) {
//                 const eventId = event.id;
//                 let eventDetails = eventMap.get(eventId);

//                 if (!eventDetails) {
//                     eventDetails = {
//                         eventDetails: event.toJSON(),
//                         eventTickets: []
//                     };
//                 }

//                 const tickets = await EventTickets.findAll({
//                     where: { eventId }
//                 });

//                 if (tickets.length > 0) {
//                     const processedTicketNames = new Set();

//                     tickets.forEach(ticket => {
//                         if (!processedTicketNames.has(ticket.planName)) {
//                             eventDetails.eventTickets.push({
//                                 ...ticket.toJSON(),
//                                 quantity: 0
//                             });
//                             processedTicketNames.add(ticket.planName);
//                         }
//                     });

//                     eventDetails.eventTickets.forEach(ticket => {

//                         const bookedTicket = bookedEvents.find(
//                             b => b.planId === ticket.planName && b.eventId === eventId
//                         );
//                         if (bookedTicket && bookedTicket.quantity > 0) {
//                             ticket.quantity = bookedTicket.quantity;
//                         }
//                     });
//                 }

//                 eventMap.set(eventId, eventDetails);
//             }
//         }

//         let events = Array.from(eventMap.values());

//         events = events.map(event => {
//             event.eventTickets = event.eventTickets.filter((ticket, index, self) =>
//                 index === self.findIndex(t => t.planName === ticket.planName)
//             ).filter(ticket => ticket.quantity > 0);
//             return event;
//         });

//         const eventsLength = events.length;

//         return res.status(200).json({
//             status: true,
//             events,
//             eventsLength
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ status: false, message: 'Internal server error' });
//     }
// };

// Define your API endpoint
// module.exports.BookedEventsListing = async (req, res) => {
// 	try {
// 		const userId = req.params.userId;

// 		const bookedEvents = await BookEvents.findAll({ where: { userId } });

// 		if (!bookedEvents || bookedEvents.length === 0) {
// 			return res.status(404).json({ status: false, message: 'No booked events found for the user' });
// 		}

// 		const groupedBookedEvents = {};

// 		for (const bookedEvent of bookedEvents) {
// 			const bookingId = bookedEvent.bookingId;

// 			if (!groupedBookedEvents[bookingId]) {
// 				groupedBookedEvents[bookingId] = [];
// 			}

// 			const event = await Event.findByPk(bookedEvent.eventId);
// 			if (event) {
// 				const eventTickets = await EventTickets.findOne({ where: { eventId: event.id } });

// 				if (eventTickets) {
// 					// const numberAvailableForBooking = eventTickets.number_available - bookedEvent.quantity;
// 					const numberAvailableForBooking = Math.max(eventTickets.number_available - bookedEvent.quantity, 0);

// 					const eventInfo = {
// 						...event.toJSON(),
// 						eventTickets: event.eventTickets,
// 						instructions: event.instructions
// 					};

// 					groupedBookedEvents[bookingId].push({
// 						bookedEvent: {
// 							...bookedEvent.toJSON(),
// 							number_available: numberAvailableForBooking
// 						},
// 						eventDetails: eventInfo
// 					});



// 				} else {
// 					console.error(`Event tickets not found for eventId: ${event.id}`);
// 				}
// 			} else {
// 				console.error(`Event not found for eventId: ${bookedEvent.eventId}`);
// 			}
// 		}

// 		// Merge event details for each bookingId
// 		const mergedBookedEvents = Object.values(groupedBookedEvents).map(events => {
// 			const mergedEventDetails = events.reduce((merged, current) => {
// 				return {
// 					...merged,
// 					...current.eventDetails
// 				};
// 			}, {});

// 			return {
// 				bookedEvents: events.map(event => event.bookedEvent),
// 				eventDetails: mergedEventDetails
// 			};


// 		});

// 		// let mergedBookedEvents1 = mergedBookedEvents.map(function(item){ if(item?.bookedEvents?.length){ return item;}});

// 		let emptyArray = [];

// 		mergedBookedEvents.map((item) => {
// 			if (item.bookedEvents?.length) {
// 				emptyArray.push(item);
// 			}
// 		});
// 		// mergedBookedEvents.map((item) => {
// 		// 	if(item.bookedEvents?.length){
// 		// 		return item;
// 		// 	}
// 		// });

// 		// console.log("emptyArray++++++", emptyArray)

// 		return res.status(200).json({
// 			status: true,
// 			message: 'Booked events retrieved successfully',
// 			bookedEvents: emptyArray
// 		});
// 	} catch (error) {
// 		console.error(error);
// 		return res.status(500).json({ status: false, message: error.message || 'Server error' });
// 	}
// };



module.exports.BookedEventsListing = async (req, res) => {
	try {
		const userId = req.params.userId;

		const bookedEvents = await BookEvents.findAll({ where: { userId } });

		if (!bookedEvents || bookedEvents.length === 0) {
			return res.status(404).json({ status: false, message: 'No booked events found for the user' });
		}

		const groupedBookedEvents = {};

		for (const bookedEvent of bookedEvents) {
			const bookingId = bookedEvent.bookingId;

			if (!groupedBookedEvents[bookingId]) {
				groupedBookedEvents[bookingId] = [];
			}

			const event = await Event.findByPk(bookedEvent.eventId);
			if (event) {
				const eventTickets = await EventTickets.findOne({ where: { eventId: event.id } });

				if (eventTickets) {
					// Check if payment status is "paid"
					if (bookedEvent.paymentStatus === 'paid') {
						// const numberAvailableForBooking = eventTickets.number_available - bookedEvent.quantity;
						const numberAvailableForBooking = Math.max(eventTickets.number_available - bookedEvent.quantity, 0);

						const eventInfo = {
							...event.toJSON(),
							eventTickets: event.eventTickets,
							instructions: event.instructions
						};

						groupedBookedEvents[bookingId].push({
							bookedEvent: {
								...bookedEvent.toJSON(),
								number_available: numberAvailableForBooking
							},
							eventDetails: eventInfo
						});
					}
				} else {
					console.error(`Event tickets not found for eventId: ${event.id}`);
				}
			} else {
				console.error(`Event not found for eventId: ${bookedEvent.eventId}`);
			}
		}

		// Merge event details for each bookingId
		const mergedBookedEvents = Object.values(groupedBookedEvents).map(events => {
			const mergedEventDetails = events.reduce((merged, current) => {
				return {
					...merged,
					...current.eventDetails
				};
			}, {});

			return {
				bookedEvents: events.map(event => event.bookedEvent),
				eventDetails: mergedEventDetails
			};
		});

		let filteredBookedEvents = mergedBookedEvents.filter(item => item.bookedEvents.length > 0);

		return res.status(200).json({
			status: true,
			message: 'Booked events retrieved successfully',
			bookedEvents: filteredBookedEvents
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};






BookEvents.belongsTo(Event, { foreignKey: 'eventId' });

module.exports.fetchAllBookedEvents = async (req, res) => {
	try {
		const { userId } = req.body;

		if (!userId) {
			return res.status(400).json({ success: false, error: 'Missing userId in the query parameters' });
		}

		const bookedEvents = await BookEvents.findAll({
			where: { userId },
			include: [{
				model: Event,
				where: {
					id: { [sequelize.Op.not]: null }
				},
			}],
			attributes: [],
			raw: true // Fetch plain JSON objects
		});

		const formattedBookedEvents = bookedEvents.map(event => {
			const formattedEvent = {};
			for (const key in event) {
				formattedEvent[key.replace('event.', '')] = event[key];
			}
			return formattedEvent;
		});

		const bookedEventsCount = await BookEvents.count({ where: { userId } });

		console.log("bookedEventsCount", bookedEventsCount);

		return res.json({ status: true, bookedEvents: formattedBookedEvents });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};




module.exports.fetchAllEvents = async (req, res) => {
	try {
		const allEvents = await Event.findAll();
		return res.json({ allEvents });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: error.message || 'Server error' });
	}
};

module.exports.fetchAvailableEvents = async (req, res) => {
	try {
		const { eventId } = req.body;

		if (!eventId) {
			return res.status(400).json({ error: 'Missing event ID' });
		}

		// Fetch all event tickets for the specified event ID
		const eventTickets = await EventTickets.findAll({
			where: { eventId },
			attributes: ['id', 'planName', 'price', 'number_available', 'total_number', 'description']
		});

		// Calculate total and available tickets
		let totalTickets = 0;
		let availableTickets = 0;
		eventTickets.forEach(ticket => {
			totalTickets += ticket.total_number;
			availableTickets += ticket.number_available;
		});

		return res.json({ status: true, eventTickets });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};

module.exports.fetchAttendeesByEventId = async (req, res) => {
	try {
		const { eventId } = req.params;

		if (!eventId) {
			return res.status(400).json({ error: 'Missing eventId in the request parameters' });
		}

		// Retrieve attendees list based on event_id
		const attendees = await BookEvents.findAll({ where: { eventId } });

		return res.status(200).json({ attendees });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: error.message || 'Server error' });
	}
};



module.exports.createPaymentIntent = async (req, res) => {
	try {
		const { amount, currency, customer, description, on_behalf_of, payment_method, transfer_data } = req.body;

		// Create payment intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency,
			customer,
			description,
			on_behalf_of,
			payment_method,
			transfer_data,
			// metadata: {
			//   eventId: metadata.eventId
			// }
		});

		// Send payment intent ID along with the response
		res.status(200).json({ status: true, client_secret: paymentIntent.client_secret, payment_intent_id: paymentIntent.id });
	} catch (error) {
		console.error('Error creating payment intent:', error);
		res.status(500).json({ status: false, error: 'Error creating payment intent' });
	}
};




module.exports.createPaymentIntents = async (req, res) => {
	try {
		const { amount, currency, on_behalf_of, transfer_data } = req.body;

		if (!amount || !currency) {
			return res.status(400).json({ error: 'Amount and currency are required.' });
		}

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount,
			currency: currency,
			on_behalf_of: on_behalf_of,
			transfer_data: transfer_data,
			// metadata: {
			// 	eventId: metadata.eventId
			// }
		});

		res.status(200).json({ status: true, clientSecret: paymentIntent.client_secret, amount, currency, payment_intent_id: paymentIntent.id });
	} catch (error) {
		console.error('Error creating payment intent:', error);
		res.status(500).json({ status: false, error: 'An error occurred while creating payment intent.' });
	}
};




module.exports.confirmPaymentIntent = async (req, res) => {
	try {
		console.log("Request Body:", req.body); // Log the request body to see what's being sent
		const { payment_Intent_id, payment_method_id } = req.body; // Extract id and method from the request body

		// Check if payment_Intent_id is present
		if (!payment_Intent_id) {
			throw new Error('Payment Intent ID is missing in the request.');
		}

		// Confirm the payment intent by its unique identifier from the request body
		const payment_Intent = await stripe.paymentIntents.confirm(payment_Intent_id, {
			payment_method: payment_method_id, // Ensure to use correct parameter name here
		});

		// Return the confirmed payment intent along with the custom status
		return res.status(200).json({ status: true, payment_Intent });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};




module.exports.listPaymentIntents = async (req, res) => {
	try {
		const paymentIntents = await stripe.paymentIntents.list();

		if (!paymentIntents || paymentIntents.data.length === 0) {
			return res.status(404).json({ status: false, message: 'No payment intents found' });
		}

		return res.status(200).json({ status: true, paymentIntents });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};



module.exports.PaymentMethods = async (req, res) => {
	try {
		const { card } = req.body;

		// Check if card details are provided
		if (!card || typeof card !== 'object') {
			return res.status(400).json({ status: false, message: 'Invalid card details' });
		}

		const createdPaymentMethod = await stripe.paymentMethods.create({
			type: 'card',
			card: {
				number: card.number,
				exp_month: card.exp_date.split('/')[0],
				exp_year: card.exp_year,
				cvc: card.cvv
			}
		});

		return res.status(201).json({ status: true, payment_method: createdPaymentMethod });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};



module.exports.updateCustomer = async (req, res) => {
	try {
		const { customerId, updatedDetails } = req.body;

		// Update customer details using the Stripe API
		const updatedCustomer = await stripe.customers.update(customerId, updatedDetails);

		// Return success response with updated customer data
		res.status(200).json({ success: true, customer: updatedCustomer });
	} catch (error) {
		console.error('Error updating customer details:', error.message);
		res.status(500).json({ success: false, message: 'Error updating customer details' });
	}
};


module.exports.getAllCards = async (req, res) => {
	try {
		const customerId = req.params.customerId;

		if (!customerId) {
			return res.status(400).json({ success: false, message: 'Customer ID is required' });
		}

		const cards = await stripe.paymentMethods.list({
			customer: customerId,
			type: 'card',
		});

		res.status(200).json({ success: true, cards: cards.data });
	} catch (error) {
		console.error('Error fetching cards:', error);
		res.status(500).json({ success: false, message: 'Error fetching cards' });
	}
};




module.exports.getSingleStripeCustomer = async (req, res) => {
	try {
		const { cardId } = req.params;

		const paymentMethod = await stripe.paymentMethods.retrieve(cardId);

		const customerId = paymentMethod.customer;

		const customer = await stripe.customers.retrieve(customerId);

		console.log("customer", customer);

		res.status(200).json({ success: true, customer });
	} catch (error) {
		console.error('Error fetching customer data:', error.message);
		res.status(500).json({ success: false, message: 'Error fetching customer data' });
	}
};



module.exports.getCustomers = async (req, res) => {
	try {
		const customers = await stripe.customers.list();
		console.log("customers", customers);
		return res.status(200).json({ success: true, customers: customers.data });
	} catch (error) {
		console.error('Error fetching customers:', error);
		return res.status(500).json({ success: false, message: 'Error fetching customers' });
	}
};



module.exports.addCustomerBankAccount = async (req, res) => {
	try {
		const { customerId, account } = req.body;

		// Create the bank account for the customer
		const bankAccount = await stripe.customers.createSource(
			customerId,
			{
				source: {
					object: 'bank_account',
					country: account.country,
					currency: account.currency,
					account_holder_name: account.account_holder_name,
					account_holder_type: account.account_holder_type,
					routing_number: account.routing_number,
					account_number: account.account_number
				}
			}
		);

		res.status(201).json({ success: true, bankAccount });
	} catch (error) {
		console.error('Error adding account to customer:', error.message);
		res.status(500).json({ success: false, message: 'Error adding account to customer' });
	}
};


module.exports.getAllTransactions = async (req, res) => {
	try {
		const transactionsData = await stripe.issuing.transactions.list({
			limit: 3,
		});

		for (const transaction of transactionsData.data) {
			await Transactions.findOrCreate({
				where: { stripe_transaction_id: transaction.id },
				defaults: {
					stripe_transaction_id: transaction.id,
					amount: transaction.amount,
					currency: transaction.currency,
					merchant: transaction.merchant_data.name,
					card: transaction.card.cardholder.name,
					description: transaction.description,
					status: transaction.status,
					created: new Date(transaction.created * 1000),
				}
			});
		}

		res.status(200).json({ success: true, message: 'Transactions saved successfully', transactionsData });
	} catch (error) {
		console.error('Error fetching transactions:', error); // Log the entire error object
		res.status(500).json({ success: false, message: 'Error fetching transactions' });
	}
};


module.exports.createStripeCustomer = async (req, res) => {
	try {
		const { email, name } = req.body;

		if (!email) {
			return res.status(400).json({ status: false, message: 'Email is required' });
		}

		const customer = await stripe.customers.create({
			email,
			name,
		});

		return res.status(201).json({ status: true, customer });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};

module.exports.attachPaymentMethodToCustomer = async (req, res) => {
	try {
		const { customerId, payment_method } = req.body;

		if (!customerId || !payment_method) {
			return res.status(400).json({ status: false, message: 'Customer ID and Payment Method are required' });
		}

		// Attach the payment method to the customer
		await stripe.paymentMethods.attach(payment_method, {
			customer: customerId,
		});

		return res.status(200).json({ status: true, message: 'Payment method attached to customer successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};



module.exports.detachPaymentMethodFromCustomer = async (req, res) => {
	try {
		const { customerId, payment_method } = req.body;

		if (!customerId || !payment_method) {
			return res.status(400).json({ status: false, message: 'Customer ID and Payment Method ID are required' });
		}

		// Detach the payment method from the customer
		await stripe.paymentMethods.detach(payment_method);

		return res.status(200).json({ status: true, message: 'Payment method detached from customer successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};

module.exports.createAccountLink = async (req, res) => {
	try {
		const { account, refresh_url, return_url, type } = req.body;

		// Create the Stripe account link
		const accountLink = await stripe.accountLinks.create({
			account,
			refresh_url,
			return_url,
			type,
		});

		res.status(200).json({ status: true, accountLink });
	} catch (err) {
		console.error('Error creating account link:', err.message);
		res.status(500).json({ status: false, error: 'Failed to create account link' });
	}
};



module.exports.addCard = async (req, res) => {
	try {
		const { customer_id, token, saveCard } = req.body;

		if (!customer_id || !token) {
			return res.status(400).json({ status: false, message: 'Missing required parameters' });
		}

		let card;

		if (saveCard) {
			card = await stripe.customers.createSource(customer_id, { source: token });
		} else {
			card = await stripe.customers.createSource(customer_id, { source: token });
		}

		return res.status(201).json({ status: true, card });
	} catch (error) {
		// Handle errors
		console.error(error);
		return res.status(500).json({ status: false, message: error.message || 'Server error' });
	}
};




module.exports.insertImage = async (req, res) => {
	try {
		const id = req.params.id;
		const updateData = req.body;

		// Fetch the current data from the database
		const existingRecord = await Event.findByPk(id);
		if (!existingRecord) {
			return res.status(404).json({ status: false, message: 'Record not found' });
		}

		// Compare the user's input with the current data
		for (const key in updateData) {
			if (existingRecord[key] !== updateData[key]) {
				existingRecord[key] = updateData[key];
			}
		}

		if (req.file) {
			const fileName = req.file.filename;
			const basePath = `${process.env.IMAGE_BASEURL}`
			existingRecord.events.thumbnail = `${basePath}/${fileName}`;
			existingRecord.events.image = `${basePath}/${fileName}`;
		}

		existingRecord.changed('events', true);

		// Save the updated record
		await existingRecord.save();

		res.json({ status: true, message: 'Record updated successfully' });

	} catch (error) {
		console.log(error)
		return res.status(500).send({
			status: false,
			error: error.message,
		});
	}
}


module.exports.updateEvent = async (req, res) => {
	try {
		const eventData = req.body;

		if (eventData) {
			const events = eventData.events;
			const event_id = eventData.event_id;

			if (events && event_id) {
				const existingEvent = await Event.findByPk(event_id);

				if (existingEvent) {
					existingEvent.events = events;

					await existingEvent.save();

					res.json({ status: true, existingEvent });
				} else {
					const event = await Event.create({
						events: events,
					});

					res.json({ status: true, event });
				}
			} else {
				res.status(400).json({ error: 'Missing parameters in event data' });
			}
		} else {
			res.status(400).json({ error: 'Missing event data in the request body' });
		}
	} catch (error) {
		return res.status(500).send({
			status: false,
			error: error.message,
		});
	}
}

module.exports.deleteEvent = async (req, res) => {
	try {
		const eventId = req.params.id;

		if (!eventId) {
			return res.status(400).json({ error: 'Missing event ID in the request' });
		}


		const event = await Event.findByPk(eventId);

		if (!event) {
			return res.status(404).json({ error: 'Event not found' });
		}


		await event.destroy();

		return res.json({ status: true, message: 'Event deleted successfully' });
	} catch (error) {
		return res.status(500).send({
			status: false,
			error: error.message,
		});
	}
};

module.exports.eventListing = async (req, res) => {
	try {
		const user_id = req.params.id;


		if (!user_id) {
			return res.status(400).json({ error: 'Missing user id in the request' });
		}


		const event = await Event.findAll({
			where: {
				user_id
			},
		});

		const combinedArray = [];
		if (event && event.length > 0) {
			event.map((val) => {
				val.events.id = val?.id;
				val.events.user_id = val?.user_id;
				val.events.event_category = val?.event_category;
				combinedArray.push(val.events);
			})
		}
		const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);

		return res.json({ status: true, events: flattenedArray });

	} catch (error) {
		return res.status(500).send({
			status: false,
			error: error.message,
		});
	}
};
