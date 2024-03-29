const {
	Event,
	City,
	User,
	EventCategory,
	BookEvents,
	EventTickets,
	Payment,
	Transactions
} = require("../models");
const sequelize = require("sequelize");
const stripe = require('stripe')('sk_test_2goAzwq8eehY90v9GfXklsty');

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

		if (!events || !user_id) {
			return res.status(400).json({ error: 'Missing parameters in event data' });
		}

		const slug = events.title
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '-')
			.replace(/-{2,}/g, '-')
			.replace(/^-|-$/g, '');

		events.slug = slug;

		const event = await Event.create({
			city_id,
			events,
			link,
			user_id,
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


const { v4: uuidv4 } = require('uuid');

function generateBookingId() {
	const uuid = uuidv4().replace(/-/g, '');
	return uuid.substr(0, 15);
}

module.exports.bookEvent = async (req, res) => {
    try {
        const { userId, firstName, lastName, email, phoneNumber, transactionId, bookings } = req.body;

        if (!userId || !firstName || !lastName || !email || !phoneNumber || !transactionId) {
            return res.status(400).json({ error: 'Missing user details or transaction ID' });
        }

        if (!bookings || bookings.length === 0) {
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

            await EventTickets.update(
                { number_available: eventTickets.number_available - quantity },
                { where: { id: eventTickets.id } }
            );
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

        return res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message || 'Server error' });
    }
};



// Function to generate a random ticket number
function generateTicketNumber() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}






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
			where: { eventId },
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

module.exports.getAllTransactionsofcustomer = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'Missing user ID' });
        }

        // Fetch user details including stripeCustomerId
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch transactions based on customer ID
        const transactions = await Transactions.findAll({ where: { customer: user.stripeCustomerId } });

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this user' });
        }

        // Fetch events associated with each transaction and push them into the transactions array
        const transactionDetails = [];
        for (const transaction of transactions) {
            const { payment_intent } = transaction;

            // Fetch booked events associated with this payment_intent
            const bookedEvents = await BookEvents.findAll({
                where: { transactionId: payment_intent }
            });

            const eventId = bookedEvents.map(event => event.eventId);

            // Fetch event details for each eventId
            const events = await Event.findAll({
                where: { id: eventId }
            });

            transactionDetails.push({
                transaction: transaction.toJSON(),
                bookedEvents: bookedEvents.map(event => event.toJSON()), // Push bookedEvents
                events: events.map(event => event.toJSON()) // Push events directly
            });
        }

        if (transactionDetails.length === 0) {
            return res.status(404).json({ message: 'No events found for any transactions' });
        }

        return res.status(200).json({ status: true, transactions: transactionDetails });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, error: 'Internal server error' });
    }
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
					const numberAvailableForBooking = eventTickets.number_available - bookedEvent.quantity;

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

		return res.status(200).json({
			status: true,
			message: 'Booked events retrieved successfully',
			bookedEvents: mergedBookedEvents
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
			transfer_data
		});

		res.status(200).json({ status: true, client_secret: paymentIntent.client_secret });
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
			transfer_data: transfer_data
		});

		res.status(200).json({ status: true, clientSecret: paymentIntent.client_secret, amount, currency });
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
