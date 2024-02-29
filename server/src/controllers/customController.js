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
const stripe = require('stripe')('sk_test_51MpRqnSAkAIYDuQTc5Qk9pZAGwuBW9EY2SFUzavSQKOgXf1SuABpMBrHxvYyJLvefxyBrLzm9JGoKHvFFFlfBIWM0051nUk2NU');

module.exports.insertEvent = async (req, res) => {

  try {
    console.log('req.files',req.file)
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
    console.log('req.files',req.files)
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
    const newNumberAvailable = updatedEventTickets.number_available - 1;
    await EventTickets.update({ number_available: newNumberAvailable }, { where: { eventId } });

    // Update event status to "sold out" if number_available becomes 0
    if (newNumberAvailable === 0) {
      await EventTickets.update({ status: 'sold out' }, { where: { eventId } });
    }

    // Retrieve total number available after updating
    const totalEventTickets = await EventTickets.sum('number_available', { where: { eventId } });
    const updatedAvailableTickets = await EventTickets.sum('total_number', { where: { eventId } });

    return res.status(201).json({
      status: true,
      message: 'Event booked successfully',
      booking,
      number_available: totalEventTickets,
      total_number: updatedAvailableTickets,
      event_status: newNumberAvailable === 0 ? 'sold out' : 'available' // Include event status based on number_available
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
      const { amount, currency, payment_method, return_url, description, customer } = req.body;

      // Extract customer details from the request body
      const { name, address } = customer;

      // Determine if the currency is INR
      const isINRCurrency = currency.toLowerCase() === 'inr';

      // Create a payment intent with the given amount, currency, and payment method
      const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          payment_method,
          confirm: true, // Set confirm option to true for automatic confirmation
          return_url,   // Specify the return URL here
          description,
          customer: customer.id, // Assuming customer.id is the correct field for Stripe
          shipping: isINRCurrency ? undefined : {  // Only provide shipping address if currency is not INR
              name,
              address: {
                  line1: address.line1,
                  city: address.city,
                  postal_code: address.postal_code,
                  state: address.state,
                  country: address.country,
              },
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
          description: paymentIntent.description,
          customer: paymentIntent.customer,
      });

      // Return the created payment intent
      return res.status(201).json({ status: true, paymentIntent });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: error.message || 'Server error' });
  }
};








module.exports.confirmPaymentIntent = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;
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
    const transactionsData = await stripe.charges.list({
      limit: 100,
      expand: ['data.balance_transaction']
    });

    for (const transaction of transactionsData.data) {
      await Transactions.findOrCreate({
        where: { stripe_charge_id: transaction.id },
        defaults: {
          stripe_charge_id: transaction.id,
          amount: transaction.amount,
          currency: transaction.currency,
          captured: transaction.captured,
          created: new Date(transaction.created * 1000), 
          payment_intent: transaction.payment_intent,
          payment_method: transaction.payment_method,
          customer: transaction.customer,
          description: transaction.description,
          status: transaction.status,
          receipt_url: transaction.receipt_url
        }
      });
    }

    res.status(200).json({ success: true, message: 'Transactions saved successfully', transactionsData });
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
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
