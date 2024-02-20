const {
  Event,
  City,
  User,
  EventCategory,
  BookEvents,
  EventTickets,
  Payment
} = require("../models");
const sequelize = require("sequelize");
const stripe = require('stripe')('sk_test_51J5UL0SCPV0fY7yzRcT86ZI3dTHCLumvsKTOhT1YMLXXB3fK9gY3kSANkCdP42Qb1SzNHehxD6F4VYyjkUil9By500XAU8bDPv');

// module.exports.insertEvent = async (req, res) => {
//   try {
//     const eventData = req.body;
//     console.log({ eventData })
//     let city_name = req.body.events.city_name;
//     console.log('cityName', city_name)
//     if (city_name) {
//       const city = await City.findOne({
//         where: sequelize.where(
//           sequelize.fn('LOWER', sequelize.col('city')),
//           sequelize.fn('LOWER', city_name)
//         ),
//       });

//       if (eventData && city) {
//         const city_id = city.id;
//         const events = eventData.events;
//         const link = eventData.link ? eventData.link : '';
//         const user_id = eventData.user_id;
//         // const event_category = eventData.category_id;
//         // // check event category weather it exists or not
//         // if(!await EventCategory.findByPk(event_category)){
//         //   return res.status(400).json({ error: 'Event category not found' });
//         // }

//         if (city_id && events && user_id) {
//           const slug = events.title
//             .toLowerCase()
//             .replace(/[^a-z0-9]/g, '-')
//             .replace(/-{2,}/g, '-')
//             .replace(/^-|-$/g, '');
//           events.slug = slug;

//           const event = await Event.create({
//             city_id: city_id,
//             events: events,
//             link: link,
//             user_id: user_id,
//           });

//           res.json({ status: true, event });
//         } else {
//           res.status(400).json({ error: 'Missing parameters in event data' });
//         }
//       } else {
//         res.status(400).json({ error: 'Missing event data in the request body' });
//       }
//     } else {
//       res.status(400).json({ error: 'Missing city name in event data' });
//     }
//   } catch (error) {
//     return res.status(500).send({
//       status: false,
//       error: error.message,
//     });
//   }
// }

module.exports.insertEvent = async (req, res) => {
  try {
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


module.exports.bookEvent = async (req, res) => {
  try {
      const { userId, eventId, amount, firstName, lastName, email, phoneNumber, planId } = req.body;
      if (!userId || !eventId || !amount || !firstName || !lastName || !email || !phoneNumber || !planId) {
          return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Create a booking with the provided data
      const booking = await BookEvents.create({
          userId,
          eventId,
          planId,
          amount,
          firstName,
          lastName,
          email,
          phoneNumber
      });

      // Retrieve updated event tickets and total event tickets
      const updatedEventTickets = await EventTickets.findOne({ where: { eventId } });

      // Check if updatedEventTickets is null
      if (!updatedEventTickets) {
          return res.status(404).json({ error: 'Event ticket not found' });
      }

      // Decrease number_available by 1
      await EventTickets.update({ number_available: updatedEventTickets.number_available - 1 }, { where: { eventId } });

      // Retrieve total number available after updating
      const totalEventTickets = await EventTickets.sum('number_available', { where: { eventId } });
      const updatedAvailableTickets = await EventTickets.sum('total_number', { where: { eventId } });

      return res.status(201).json({ 
          status: true, 
          message: 'Event booked successfully', 
          booking, 
          number_available: totalEventTickets,
          total_number: updatedAvailableTickets
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
        const { amount, currency, payment_method } = req.body;

        // Create a payment intent with the given amount, currency, and payment method
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Save the paymentIntent data into the database
        await Payment.create({
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            payment_method: paymentIntent.payment_method,
            status: paymentIntent.status,
            client_secret: paymentIntent.client_secret,
        });
        // Return the created payment intent
        return res.status(201).json({ status: true, paymentIntent, Payment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message || 'Server error' });
    }
};




module.exports.confirmPaymentIntent = async (req, res) => {
  try {
      const { id } = req.params;
      const { payment_method } = req.body; // Assuming payment_method is provided in the request body

      // Confirm the payment intent by its unique identifier and provide the payment method
      const paymentIntent = await stripe.paymentIntents.confirm(id, {
          payment_method,
          return_url: 'https://yourwebsite.com/payment-success'
      });

      // Return the confirmed payment intent along with the custom status
      return res.status(200).json({ status: true, paymentIntent });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: error.message || 'Server error' });
  }
};



module.exports.listPaymentIntents = async (req, res) => {
  try {
      const paymentIntents = await stripe.paymentIntents.list();

      return res.status(200).json({ status: true,paymentIntents });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: error.message || 'Server error' });
  }
};


module.exports.PaymentMethods = async (req, res) => {
  try {
      const { card } = req.body;
      const createdPaymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card
      });

      return res.status(201).json({ status: true, payment_method: createdPaymentMethod });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: error.message || 'Server error' });
  }
};

module.exports.updateCardInfo = async (req, res) => {
  try {
      const { customerId, cardId, cardData } = req.body;

      // Update card information using the Stripe API
      const updatedCard = await stripe.customers.updateSource(
          customerId,
          cardId,
          cardData
      );
console.log("updatedCard", updatedCard);
      // Return success response
      res.status(200).json({ success: true, card: updatedCard });
  } catch (error) {
      console.error('Error updating card info:', error);
      res.status(500).json({ success: false, message: 'Error updating card info' });
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
