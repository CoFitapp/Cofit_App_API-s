const {
  Event,
  City,
  User,
  BookEvents,
  NewUser
} = require("../models");
const sequelize = require("sequelize");
const axios = require('axios');
const { CLIENT_RENEG_LIMIT } = require("tls");
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const { Op } = require('sequelize');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// module.exports.getEvents = async (req, res) => {
//   try {register
//     let city_name = req.body.city_name;
//     console.log("page", req.body.page);
//     let page = parseInt(req.body.page) || 1;
//     const limit = 9;
//     const offset = (page - 1) * limit;

//     if (city_name) {
//       const city = await City.findOne({
//         where: sequelize.where(
//           sequelize.fn('LOWER', sequelize.col('city')),
//           sequelize.fn('LOWER', city_name)
//         ),
//       });

//       if (city) {
//         const events = await Event.findAll({
//           where: { city_id: city.id },
//           // limit: limit,
//           // offset: offset,
//         });

//         console.log('offset', offset);
//         console.log('events', events);

//         if (events && events.length > 0) {
//           const combinedArray = [];

//           for (const event of events) {
//             event.events.id = event?.id;
//             combinedArray.push(event.events);
//           }
//           const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);

//           // const count = await Event.count({
//           //   where: { city_id: city.id }
//           // })

//           // const totalPages = Math.ceil(count / limit);
//           // 
//           // res.json({
//           //   events: flattenedArray,
//           //   currentPage: page, totalRecords: count, totalPages
//           // });
//         res.json(flattenedArray);

//         } else {
//           res.json([]);
//         }
//       } else {
//         let city = await City.create({
//           city: city_name,
//         });

//         const apiCity = encodeURIComponent(city_name).replace(/%20/g, ' ');
//         const apiUrl = `https://serpapi.com/search?engine=google_events&q=fitness%20events%20in%20${apiCity}&hl=en&api_key=${process.env.SERP_API}&htichips=date:month&start=0`;

//         const response = await axios.get(apiUrl);
//         const apiResult = response.data.events_results;
//         const combinedArray = [];
//         if (apiResult) {
//           for (const result of apiResult) {
//             let eventDetail = await Event.findOne({
//               where: {
//                 link: result?.link,
//                 city_id: city?.id,
//               },
//             });

//             if (!eventDetail) {
//               eventDetail = await Event.create({
//                 city_id: city?.id,
//                 events: result,
//                 link: result?.link,
//               });
//             } else {
//               eventDetail.events = result;
//               await eventDetail.save();
//             }

//             eventDetail.events.id = eventDetail?.id;
//             combinedArray.push(eventDetail.events);
//           }
//         }
//         const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);

//         loadRestOfEvents(city?.id);

//         res.json(flattenedArray);


//       }
//     } else {
//       const allEvents = await Event.findAll({
//         where: {
//           'user_id': {
//             [sequelize.Op.ne]: null
//           }
//         },
//         offset: offset,
//         limit: limit,
//       });

//       console.log("allEvents", allEvents.length);
//       const combinedArray = [];

//       for (const event of allEvents) {
//         event.events.id = event?.id;
//         combinedArray.push(event.events);
//       }

//       const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);

//       const count = await Event.count()

//       const totalPages = Math.ceil(count / limit);
//       // 
//       res.json({
//         events: flattenedArray,
//         currentPage: page, totalRecords: count, totalPages
//       });

//       // res.json(flattenedArray);
//     }
//   } catch (error) {
//     return res.status(200).send({
//       status: false,
//       error,
//     });
//   }
// };



// Define your cron job


// Import necessary modules and define constants like Op

// Define your models (e.g., Event)

// Function to extract month and day from start_date





// Cron job to update events' year based on their start_date, month, and day
// cron.schedule('* * * * *', async () => {
//   console.log("Cron job running...");
//   try {
//     const eventsToUpdate = await Event.findAll();

//     // Update slugs for all events
//     for (const event of eventsToUpdate) {
//       let count = 1;
//       // Check if events object exists and has a title, and if slug is not defined
//       if (event.events && event.events.title && !event.events.slug) {
//         let slug = event.events.title
//           .toLowerCase()
//           .replace(/[^a-z0-9]/g, '-')
//           .replace(/-{2,}/g, '-')
//           .replace(/^-|-$/g, '');

//         // Check if the generated slug already exists in the database
//         let existingEvent = await Event.findOne({ where: { 'events.slug': slug } });

//         // If the slug already exists, append count + 1
//         while (existingEvent) {
//           slug = `${slug}-${count}`;
//           existingEvent = await Event.findOne({ where: { 'events.slug': slug } });
//           count++;
//         }
//         // Update the slug in the events object
//         event.events.slug = slug;

//         // Save the updated events object back to the database
//         await Event.update({ events: event.events }, { where: { id: event.id } });
//       }
//     }

//     console.log('Slugs added/updated for all events.');

//   } catch (error) {
//     console.error('Error updating events\' slug:', error.message);
//   }
// });


// const getLatLongFromAddress = async (address) => {
//   try {
//     const apiKey = process.env.GOOGLE_API_KEY;
//     const formattedAddress = encodeURIComponent(address.join(', '));
//     const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${apiKey}`;

//     const response = await axios.get(apiUrl);
//     if (response.status === 200 && response.data.status === 'OK' && response.data.results.length > 0) {
//       const location = response.data.results[0].geometry.location;
//       return {
//         latitude: location.lat,
//         longitude: location.lng
//       };
//     } else {
//       console.error('No results found or unexpected response:', response.data);
//     }
//   } catch (error) {
//     console.error('Error fetching geolocation:', error.response?.status, error.response?.data, error.message);
//   }
//   return null;
// };


const getLatLongFromAddress = async (address) => {
  console.log("getLatLongFromAddress")
  try {
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;

    // Ensure we only take the first element if address array length is greater than 2
    const primaryAddress = address.length > 2 ? address[0] : address;
    const formattedAddress = encodeURIComponent(primaryAddress);

    const apiUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${formattedAddress}&access_token=${accessToken}`;

    const response = await axios.get(apiUrl);
    if (response.status === 200 && response.data.features && response.data.features.length > 0) {
      const location = response.data.features[0].geometry.coordinates;
      return {
        latitude: location[1],
        longitude: location[0]
      };
    } else {
      console.error('No results found or unexpected response:', response.data);
    }
  } catch (error) {
    console.error('Error fetching geolocation:', error.response?.status, error.response?.data, error.message);
  }
  return null;
};


// Function to update events with missing latitude and longitude
// const updateEventsWithMissingLatLong = async () => {
//   try {
//     // Find all events without latitude and longitude
//     const events = await Event.findAll({
//       where: {
//         [Op.or]: [
//           sequelize.literal("json_unquote(json_extract(events, '$.latitude')) IS NULL"),
//           sequelize.literal("json_unquote(json_extract(events, '$.longitude')) IS NULL")
//         ]
//       }
//     });

//     for (const event of events) {
//       // Extract the address from the event details
//       const address = event.events?.address;
//       if (address) {
//         // Log the address being processed
//         console.log(`Processing address: ${address.join(', ')}`);

//         // Get latitude and longitude
//         const location = await getLatLongFromAddress(address);

//         if (location) {
//           // Update event with latitude and longitude
//           const updatedEvents = {
//             ...event.events,
//             latitude: location.latitude,
//             longitude: location.longitude
//           };

//           // Update the event
//           await event.update({ events: updatedEvents });
//           console.log(`Updated event ${event.id} with latitude ${location.latitude} and longitude ${location.longitude}`);
//         } else {
//           console.log(`Could not update event ${event.id} due to missing location data.`);
//         }
//       }
//     }

//     console.log(`Completed updating events with missing latitude and longitude.`);
//   } catch (error) {
//     console.error('Error updating events with missing latitude and longitude:', error.message);
//   }
// };

// // Schedule the cron job to run every day at midnight
// cron.schedule('* * * * *', async () => {
//   console.log('Running the update events with missing latitude and longitude cron job...');
//   await updateEventsWithMissingLatLong();
// });

const updateEventYears = async () => {
  try {
    const currentYear = new Date().getFullYear();

    // Find all events
    const events = await Event.findAll();

    // Update year for each event
    for (const event of events) {
      const eventYear = event?.year || currentYear;
      event.year = eventYear;
      await event.save();
    }

    console.log(`All events have been updated with the year ${currentYear}`);
  } catch (error) {
    console.error('Error updating event years:', error);
  }
};

// Schedule the cron job to run every day at midnight
cron.schedule('* * * * *', async () => {
  console.log('Running the event year update cron job...');
  await updateEventYears();
});

module.exports.getEvents = async (req, res) => {
  try {
    let city_name = req.body.city_name;
    let page = parseInt(req.body.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;
    const currentYear = new Date().getFullYear();

    if (city_name) {
      const city = await City.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('city')),
          sequelize.fn('LOWER', city_name)
        ),
      });

      if (city) {
        const events = await Event.findAll({
          where: { city_id: city.id },
        });

        if (events && events.length > 0) {
          const combinedArray = await Promise.all(events.map(async (event) => {
            event.events.id = event?.id;
            event.events.year = event?.year;
            if (event.eventTickets && event.eventTickets.length > 0) {
              event.events.eventTicketsNumber = event.eventTickets.map(ticket => ticket.number);
            } else {
              event.events.eventTicketsNumber = "100";
            }

            // Get latitude and longitude
            const location = await getLatLongFromAddress(event.events.address);
            if (location) {
              event.events.latitude = location.latitude;
              event.events.longitude = location.longitude;
            }

            return event.events;
          }));

          const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);

          return res.json(flattenedArray);
        } else {
          return res.json([]);
        }
      } else {
        const newCity = await City.create({
          city: city_name,
        });

        // Fetch events from SERP API
        const apiCity = encodeURIComponent(city_name).replace(/%20/g, ' ');
        const apiUrl = `https://serpapi.com/search?engine=google_events&q=fitness%20events%20in%20${apiCity}&hl=en&api_key=${process.env.SERP_API}&htichips=date:month&start=0`;

        const response = await axios.get(apiUrl);
        const apiResult = response.data.events_results;
        const numberOfEvents = apiResult.length;
        console.log("numberOfEvents", numberOfEvents);
        if (apiResult && apiResult.length > 0) {
          const savedEvents = [];

          for (const result of apiResult) {
            // Check if the event already exists in the database
            let eventDetail = await Event.findOne({
              where: {
                link: result?.link,
                city_id: newCity?.id,
              },
            });

            if (!eventDetail) {
              // Generate unique slug for the event
              let count = 1;
              let slug = result.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-{2,}/g, '-')
                .replace(/^-|-$/g, '');

              let existingEvent = await Event.findOne({
                where: sequelize.where(
                  sequelize.fn('JSON_CONTAINS', sequelize.col('events'), JSON.stringify({ slug })),
                  true
                )
              });

              while (existingEvent) {
                slug = `${slug}-${count}`;
                existingEvent = await Event.findOne({
                  where: sequelize.where(
                    sequelize.fn('JSON_CONTAINS', sequelize.col('events'), JSON.stringify({ slug })),
                    true
                  )
                });
                count++;
              }

              // Determine event year based on start_date
              const eventYear = result?.date?.start_date?.includes('Dec') ? currentYear + 1 : currentYear;

              // Get latitude and longitude
              const location = await getLatLongFromAddress(result.address);
              if (location) {
                result.latitude = location.latitude;
                result.longitude = location.longitude;
              }

              // Create the event in the database
              result.slug = slug;
              result.year = result.year || new Date().getFullYear();

              eventDetail = await Event.create({
                city_id: newCity.id,
                events: result,
                link: result?.link,
                year: eventYear,
                slug: result.slug
              });

              savedEvents.push(eventDetail.events); // Push saved event details to array
            } else {
              // Update event details if it already exists
              eventDetail.events = result;
              await eventDetail.save();

              savedEvents.push(eventDetail.events); // Push updated event details to array
            }
          }

          // Load rest of events function
          loadRestOfEvents(newCity?.id);

          return res.json(savedEvents); // Return early after sending response
        } else {
          return res.json([]); // Return early after sending response
        }
      }
    } else {
      // Handle searchQuery and initialLocation logic when city_name is not provided
      const { searchQuery, initialLocation } = req.body;

      const query = {
        where: {
          isFeatured: 1,
          [sequelize.Op.and]: [
            {
              'user_id': {
                [sequelize.Op.ne]: null
              }
            },
            {
              [sequelize.Op.or]: [
                { 'events.title': { [sequelize.Op.like]: `%${searchQuery}%` } },
                { 'events.description': { [sequelize.Op.like]: `%${searchQuery}%` } },
              ]
            }
          ]
        },
        offset: offset,
        limit: limit
      };

      if (initialLocation) {
        const locations = initialLocation.split(",").map(location => location.trim());
        query.where[sequelize.Op.and].push({ 'events.address': { [Op.ne]: '' } });

        const locationConditions = locations.map(location => ({
          [Op.or]: [
            { 'events.address': { [sequelize.Op.like]: `%${location}%` } },
            { 'events.address': location }
          ]
        }));

        query.where[sequelize.Op.and].push(...locationConditions);
      }

      const filteredEvents = await Event.findAll(query);

      const combinedArray = await Promise.all(filteredEvents.map(async (event) => {
        event.events.id = event?.id;

        // Get latitude and longitude
        const location = await getLatLongFromAddress(event.events.address);
        if (location) {
          event.events.latitude = location.latitude;
          event.events.longitude = location.longitude;
        }

        return event.events;
      }));

      const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);

      const count = await Event.count({
        where: {
          [sequelize.Op.and]: [
            {
              'user_id': {
                [sequelize.Op.ne]: null
              }
            },
            {
              [sequelize.Op.or]: [
                { 'events.title': { [sequelize.Op.like]: `%${searchQuery}%` } },
                { 'events.description': { [sequelize.Op.like]: `%${searchQuery}%` } }
              ]
            }
          ]
        }
      });

      const totalPages = Math.ceil(count / limit);

      return res.json({
        events: flattenedArray,
        currentPage: page,
        totalRecords: count,
        totalPages
      });
    }
  } catch (error) {
    console.error("Get Event Error:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};






const loadRestOfEvents = async (id) => {
  try {
    let city = await City.findByPk(id);
    const { city: cityName } = city;

    for (let sum = 0; sum <= 90; sum += 10) {
      const apiCity = encodeURIComponent(cityName).replace(/%20/g, ' ');
      const apiUrl = `https://serpapi.com/search?engine=google_events&q=fitness%20events%20in%20${apiCity}&hl=en&api_key=${process.env.SERP_API}&htichips=date:month&start=${sum}`;

      const response = await axios.get(apiUrl);
      const apiResult = response.data.events_results;

      if (!apiResult) {
        break;
      }

      for (const result of apiResult) {
        let eventDetail = await Event.findOne({
          where: {
            link: result?.link,
            city_id: id,
          },
        });

        if (!eventDetail) {
          // Event does not exist, create new event
          await Event.create({
            city_id: id,
            events: result,
            link: result?.link,
          });
        } else {
          // Event already exists, update its details
          eventDetail.events = result;
          await eventDetail.save();
        }
      }
    }
  } catch (error) {
    console.error('Error fetching or saving events:', error);
    // Handle error as needed, e.g., throw or log
  }
};


module.exports.eventDetails = async (req, res) => {
  try {
    let event_id = req.params.id;
    let event = await Event.findOne({
      where: {
        id: event_id
      }
    })

    if (event) {
      event = event?.events
    }
    return res.status(200).send({
      status: true,
      event
    })
  } catch (error) {
    return res.status(200).send({
      status: false,
      error
    })
  }
}

module.exports.eventDetail = async (req, res) => {
  const slug = req.params.slug;
  try {
    const event = await Event.findOne({ where: { 'events.slug': slug } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// module.exports.register = async (req, res) => {
//   try {

//     let full_name = req.body.name;
//     let email = req.body.email;
//     let location = req.body.location;
//     let google_id = req.body.google_id;

//     let userFind = await User.findOne({
//       where: {
//         email
//       }
//     });

//     if (!userFind) {
//       userFind = await User.create({
//         full_name,
//         location,
//         email,
//         google_id
//       });
//     }
//     else {
//       userFind = await User.update(
//         {
//           full_name,
//           location
//         },
//         {
//           where: {
//             email // Replace userEmailToUpdate with the email of the user you want to update
//           }
//         }
//       );

//       userFind = await User.findOne({
//         where: {
//           email
//         }
//       });

//     }

//     // console.log('userFind', userFind);

//     let user = {
//       id: userFind?.id,
//       name: userFind?.full_name,
//       location: userFind?.location,
//       email: userFind?.email,
//       phone_no: userFind?.phone_no,
//       profile_image: `${userFind?.profile_image ? `${process.env.IMAGE_BASEURL}/${userFind?.profile_image}` : null}`,
//     }

//     return res.status(200).send({
//       status: true,
//       user
//     })

//   } catch (error) {

//     return res.status(200).send({
//       status: false,
//       error
//     })

//   }
// }

// module.exports.register1 = async (req, res) => {
//   try {
//     let full_name = req.body.name;
//     let first_name = req.body.first_name;
//     let last_name = req.body.last_name;
//     let email = req.body.email;
//     let location = req.body.location;
//     let google_id = req.body.google_id;

//     let userFind = await User.findOne({
//       where: {
//         email,
//         google_id
//       }
//     });

//     if (!userFind) {
//       userFind = await User.create({
//         full_name,
//         location,
//         email,
//         google_id,
//         first_name,
//         last_name
//       });
//     } else {
//       userFind = await User.update(
//         {
//           full_name,
//           location,
//         },
//         {
//           where: {
//             email
//           }
//         }
//       );

//       userFind = await User.findOne({
//         where: {
//           email
//         }
//       });
//     }

//     let user = {
//       id: userFind?.id,
//       name: userFind?.full_name,
//       location: userFind?.location,
//       email: userFind?.email,
//       phone_no: userFind?.phone_no,
//       profile_image: `${userFind?.profile_image ? `${process.env.IMAGE_BASEURL}/${userFind?.profile_image}` : null}`,
//       first_name: userFind?.first_name,
//       last_name: userFind?.last_name
//     };

//     return res.status(200).send({
//       status: true,
//       user
//     });
//   } catch (error) {
//     return res.status(200).send({
//       status: false,
//       error
//     });
//   }
// };


// module.exports.register = async (req, res) => {
//   try {
//       let { name, first_name, last_name, email, location, google_id } = req.body;

//       let user = await User.findOne({ where: { email, google_id } });

//       let stripeCustomer, stripeAccount;

//       if (!user) {
//           // If the user doesn't exist, create a new Stripe customer and account
//           stripeCustomer = await stripe.customers.create({
//               email: email,
//               name: name,
//           });

//           stripeAccount = await stripe.accounts.create({
//               type: 'express',
//               country: 'US',
//               email: email,
//               business_type: 'individual',
//               individual: {
//                   first_name: first_name,
//                   last_name: last_name,
//                   email: email,
//               },
//               capabilities: {
//                 card_payments: {
//                   requested: true,
//                 },
//                 transfers: {
//                   requested: true,
//                 },
//               },
//           });

//           // Create the user in the database
//           user = await User.create({
//               full_name: name,
//               location,
//               email,
//               google_id,
//               first_name,
//               last_name,
//               stripeCustomerId: stripeCustomer.id,
//               stripeAccountId: stripeAccount.id
//           });
//       } else {
//           // Check if the user already has a Stripe customer
//           if (!user.stripeCustomerId) {
//               stripeCustomer = await stripe.customers.create({
//                   email: email,
//                   name: name,
//               });

//               // Update user with new Stripe customer ID
//               await user.update({
//                   full_name: name,
//                   location,
//                   stripeCustomerId: stripeCustomer.id
//               });
//           }

//           // Create a new Stripe account even if the customer ID exists
//           stripeAccount = await stripe.accounts.create({
//               type: 'express',
//               country: 'US',
//               email: email,
//               business_type: 'individual',
//               individual: {
//                   first_name: first_name,
//                   last_name: last_name,
//                   email: email,
//               },
//               capabilities: {
//                 card_payments: {
//                   requested: true,
//                 },
//                 transfers: {
//                   requested: true,
//                 },
//               },
//           });

//           // Update user with new Stripe account ID
//           await user.update({
//               full_name: name,
//               location,
//               stripeAccountId: stripeAccount.id
//           });
//       }

//       let formattedUser = {
//           id: user.id,
//           name: user.full_name,
//           location: user.location,
//           email: user.email,
//           phone_no: user.phone_no,
//           profile_image: user.profile_image ? `${process.env.IMAGE_BASEURL}/${user.profile_image}` : null,
//           first_name: user.first_name,
//           last_name: user.last_name,
//           stripeCustomerId: stripeCustomer ? stripeCustomer.id : user.stripeCustomerId,
//           stripeAccountId: stripeAccount ? stripeAccount.id : user.stripeAccountId
//       };

//       return res.status(200).send({
//           status: true,
//           user: formattedUser
//       });
//   } catch (error) {
//       console.error('Error registering user:', error);
//       return res.status(500).send({
//           status: false,
//           error: 'Error registering user'
//       });
//   }
// };


// module.exports.register = async (req, res) => {
//   try {
//     let { name, first_name, last_name, email, location, google_id } = req.body;

//     let user = await User.findOne({ where: { email, google_id } });

//     let stripeCustomer, stripeAccount;

//     if (!user) {
//       // If the user doesn't exist, create a new Stripe customer and account
//       stripeCustomer = await stripe.customers.create({
//         email: email,
//         name: name,
//       });

//       stripeAccount = await stripe.accounts.create({
//         type: 'express',
//         country: 'US',
//         email: email,
//         business_type: 'individual',
//         individual: {
//           first_name: first_name,
//           last_name: last_name,
//           email: email,
//         },
//         capabilities: {
//           card_payments: {
//             requested: true,
//           },
//           transfers: {
//             requested: true,
//           },
//         },
//       });

//       // Create the user in the database
//       user = await User.create({
//         full_name: name,
//         location,
//         email,
//         google_id,
//         first_name,
//         last_name,
//         stripeCustomerId: stripeCustomer.id,
//         stripeAccountId: stripeAccount.id
//       });
//     } else {
//       // Check if the user already has a Stripe account
//       if (!user.stripeAccountId) {
//         stripeAccount = await stripe.accounts.create({
//           type: 'express',
//           country: 'US',
//           email: email,
//           business_type: 'individual',
//           individual: {
//             first_name: first_name,
//             last_name: last_name,
//             email: email,
//           },
//           capabilities: {
//             card_payments: {
//               requested: true,
//             },
//             transfers: {
//               requested: true,
//             },
//           },
//         });

//         // Update user with new Stripe account ID
//         await user.update({
//           full_name: name,
//           location,
//           stripeAccountId: stripeAccount.id
//         });
//       } else {
//         // Retrieve existing Stripe account details
//         stripeAccount = await stripe.accounts.retrieve(user.stripeAccountId);
//       }
//     }

//     let formattedUser = {
//       id: user.id,
//       name: user.full_name,
//       location: user.location,
//       email: user.email,
//       phone_no: user.phone_no,
//       profile_image: user.profile_image ? `${process.env.IMAGE_BASEURL}/${user.profile_image}` : null,
//       first_name: user.first_name,
//       last_name: user.last_name,
//       stripeCustomerId: stripeCustomer ? stripeCustomer.id : user.stripeCustomerId,
//       stripeAccountId: stripeAccount ? stripeAccount.id : user.stripeAccountId
//     };

//     return res.status(200).send({
//       status: true,
//       user: formattedUser
//     });
//   } catch (error) {
//     console.error('Error registering user:', error);
//     return res.status(500).send({
//       status: false,
//       error: 'Error registering user'
//     });
//   }
// };


const sendWelcomeEmail = async (email) => {
  try {
    // Read the HTML file
    const htmlPath = path.join(__dirname, '../view/Welcome-Email.html');
    const emailHtml = fs.readFileSync(htmlPath, 'utf-8');

    // Set up the email message
    const msg = {
      to: email,
      from: 'support@cofitapp.com',
      subject: 'Welcome to Coffit',
      text: 'Registered Successfully',
      html: emailHtml,
    };

    // Send the email
    const response = await sgMail.send(msg);
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};



module.exports.register = async (req, res) => {

  try {

    let { name, first_name, last_name, email, location, google_id, search_location } = req.body;

    console.log('###register')
    console.log('####SENDGRID_API_KEY', process.env.SENDGRID_API_KEY)


    // return res.status(200).send({ email, message: "#1Email sent successfully!! " })

    let user = await User.findOne({ where: { email, google_id } });

    let stripeCustomer, stripeAccount;

    if (!user) {
      // If the user doesn't exist, create a new Stripe customer and account
      stripeCustomer = await stripe.customers.create({
        email: email,
        name: name,
      });

      stripeAccount = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: email,
        business_type: 'individual',
        individual: {
          first_name: first_name,
          last_name: last_name,
          email: email,
        },
        capabilities: {
          card_payments: {
            requested: true,
          },
          transfers: {
            requested: true,
          },
        },
      });

      // Create the user in the database
      user = await User.create({
        full_name: name,
        location,
        search_location, // Add search_location field here
        email,
        google_id,
        first_name,
        last_name,
        stripeCustomerId: stripeCustomer.id,
        stripeAccountId: stripeAccount.id
      });
    } else {
      // Check if the user already has a Stripe account
      if (!user.stripeAccountId) {
        stripeAccount = await stripe.accounts.create({
          type: 'express',
          country: 'US',
          email: email,
          business_type: 'individual',
          individual: {
            first_name: first_name,
            last_name: last_name,
            email: email,
          },
          capabilities: {
            card_payments: {
              requested: true,
            },
            transfers: {
              requested: true,
            },
          },
        });

        // Update user with new Stripe account ID
        await user.update({
          full_name: name,
          location,
          search_location, // Add search_location field here
          stripeAccountId: stripeAccount.id
        });
        user.save()



      } else {
        // Retrieve existing Stripe account details
        stripeAccount = await stripe.accounts.retrieve(user.stripeAccountId);
      }

      if (!user.stripeCustomerId) {

        console.log(' if (!user.stripeCustomerId)')
        // create customer if not exists 
        stripeCustomer = await stripe.customers.create({
          email: email,
          name: name,
        });

        console.log('stripeCustomer', stripeCustomer)

        // Update user with new Stripe account ID
        await user.update({
          stripeCustomerId: stripeCustomer.id,
        });

        user.save()

      }
      await user.update({ search_location });

    }

    let formattedUser = {
      id: user.id,
      name: user.full_name,
      location: user.location,
      search_location: user.search_location, // Add search_location field here
      email: user.email,
      phone_no: user.phone_no,
      profile_image: user.profile_image ? `${process.env.IMAGE_BASEURL}/${user.profile_image}` : null,
      first_name: user.first_name,
      last_name: user.last_name,
      stripeCustomerId: stripeCustomer ? stripeCustomer.id : user.stripeCustomerId,
      stripeAccountId: stripeAccount ? stripeAccount.id : user.stripeAccountId
    };

    // const msg = {
    //   to: email,
    //   from: 'support@cofitapp.com',
    //   subject: 'Welcome to Coffit',
    //   text: 'Registered Successfully',
    //   html: '<strong>Welcome to Coffit</strong>',
    // };

    // sgMail
    //   .send(msg)
    //   .then((response) => {
    //     console.log("##################email status", response)
    //   }, error => {
    //     console.error(error);

    //     if (error.response) {
    //       console.error(error.response.body)
    //     }
    //   });


    sendWelcomeEmail(email)

    return res.status(200).send({
      status: true,
      user: formattedUser,
      type: "updated code",
    });
  } catch (error) {
    console.error('###Error registering user:', error);
    return res.status(500).send({
      status: false,
      error: 'Error registering user'
    });
  }
};





// module.exports.deleteAccount = async (req, res) => {
//   try {
//     const { email, google_id } = req.body;

//     // Check if the user exists
//     let user = await User.findOne({ where: { email, google_id } });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Delete the user
//     await user.destroy();

//     return res.status(200).json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };



module.exports.deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the user by ID
    const user = await NewUser.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Delete the user
    await NewUser.destroy({ where: { id } });

    // Respond with success message
    res.status(200).json({ status: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: false, message: 'Failed to delete user' });
  }
};


module.exports.getUserDetails = async (req, res) => {
  try {
    let user_id = req.params.id;
    let userFind = await NewUser.findOne({
      where: {
        id: user_id
      }
    });
    console.log("userFind", userFind);
    if (!userFind) {
      throw 'No user found!';
    }
    let user = {
      id: userFind?.id,
      // name: userFind?.full_name,
      email: userFind?.email,
      first_name: userFind?.firstName,
      last_name: userFind?.lastName,
      dob: userFind?.dob,
      gender: userFind?.gender,
      phone_no: userFind?.phoneNo,
      profile_image: userFind?.profilePhoto,
      interests: userFind?.interests,
      location: userFind?.homeLocation,
      search_location: userFind?.searchLocation, // Include search_location
      googleuser: userFind?.googleuser,
      facebookuser: userFind?.facebookuser,
      appleuser: userFind?.appleuser,
      // stripeCustomerId: userFind?.stripeCustomerId,
      // stripeAccountId: userFind?.stripeAccountId,
    }
    return res.status(200).send({
      status: true,
      user
    });
  } catch (error) {
    return res.status(200).send({
      status: false,
      error
    });
  }
}


module.exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    // Fetch the current data from the database
    const existingRecord = await User.findByPk(id);

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
      existingRecord['profile_image'] = req.file.filename
    }

    // Save the updated record
    await existingRecord.save();

    res.json({ status: true, message: 'Record updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
}

module.exports.saveEvents = async (req, res) => {
  try {
    // Retrieve current year
    const currentYear = new Date().getFullYear();

    // Retrieve cities from the database
    const cities = await City.findAll();

    for (const city of cities) {
      const { id, city: cityName } = city;

      for (let sum = 0; sum <= 0; sum += 10) {
        const apiCity = encodeURIComponent(cityName).replace(/%20/g, ' ');
        const apiUrl = `https://serpapi.com/search?engine=google_events&q=fitness%20events%20in%20${apiCity}&hl=en&api_key=${process.env.SERP_API}&htichips=date:month&start=${sum}`;

        try {
          const response = await axios.get(apiUrl);
          const apiResult = response.data.events_results;
          if (!apiResult) {
            break;
          }

          for (const result of apiResult) {
            let eventDetail = await Event.findOne({
              where: {
                link: result?.link,
                city_id: id
              }
            });
            const eventYear = result?.date?.start_date?.includes('Dec') ? currentYear + 1 : currentYear;
            const location = await getLatLongFromAddress(result.address);
            if (location) {
              result.latitude = location.latitude;
              result.longitude = location.longitude;
            }
            if (!eventDetail) {
              // Insert events into the events table along with the current year
              const slug = result.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-{2,}/g, '-')
                .replace(/^-|-$/g, '');
              result.slug = slug; // Add the generated slug to the events object
              await Event.create({
                city_id: id,
                events: result,
                link: result?.link,
                year: eventYear  // Add the current year to the event
              });

            } else {
              // Update existing event's year to the current year
              eventDetail.events = result;
              const eventYear = result?.date?.start_date?.includes('Dec') ? currentYear + 1 : currentYear;
              eventDetail.year = eventYear;  // Update the year

              // Add or update slug
              if (!eventDetail.events.slug) {
                const slug = result.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '-')
                  .replace(/-{2,}/g, '-')
                  .replace(/^-|-$/g, '');
                eventDetail.events.slug = slug; // Add the generated slug to the events object
              }

              await eventDetail.save();
            }

          }

        } catch (error) {
          console.error('Error making API request or processing response:', error);
        }
      }
    }
    return res.send({
      status: true
    })
  } catch (error) {
    console.error('Error syncing database or processing cities:', error);
    return res.send({
      status: false
    })
  }
}


module.exports.saveWeeklyEvents = async (req, res) => {
  try {
    // Retrieve cities from the database
    const cities = await City.findAll();
    const currentYear = new Date().getFullYear();

    for (const city of cities) {
      const { id, city: cityName } = city;

      for (let sum = 0; sum <= 0; sum += 10) {
        const apiCity = encodeURIComponent(cityName).replace(/%20/g, ' ');
        const apiUrl = `https://serpapi.com/search?engine=google_events&q=fitness%20events%20in%20${apiCity}&hl=en&api_key=${process.env.SERP_API}&htichips=date:week&start=${sum}`;

        try {
          const response = await axios.get(apiUrl);
          const apiResult = response.data.events_results;
          if (!apiResult) {
            break;
          }

          for (const result of apiResult) {
            let eventDetail = await Event.findOne({
              where: {
                link: result?.link,
                city_id: id
              }
            });

            const eventYear = result?.date?.start_date?.includes('Dec') ? currentYear + 1 : currentYear;
            const location = await getLatLongFromAddress(result.address);
            if (location) {
              result.latitude = location.latitude;
              result.longitude = location.longitude;
            }
            if (!eventDetail) {
              // Generate slug for the event title
              let slug = result.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-{2,}/g, '-')
                .replace(/^-|-$/g, '');

              // Check for existing slug in the database
              let existingEvent = await Event.findOne({ where: { 'events.slug': slug } });

              // If the slug already exists, append count + 1
              let count = 1;
              while (existingEvent) {
                slug = `${slug}-${count}`;
                existingEvent = await Event.findOne({ where: { 'events.slug': slug } });
                count++;
              }

              // Insert events into the events table with the generated slug
              await Event.create({
                city_id: id,
                events: { ...result, slug },
                link: result?.link,
                year: eventYear
              });

            } else {
              // Update existing event details
              eventDetail.events = result;
              const eventYear = result?.date?.start_date?.includes('Dec') ? currentYear + 1 : currentYear;
              eventDetail.year = eventYear;
              await eventDetail.save();
            }
          }

        } catch (error) {
          console.error('Error making API request or processing response:', error);
        }
      }
    }
    return res.send({
      status: true
    });
  } catch (error) {
    console.error('Error syncing database or processing cities:', error);
    return res.send({
      status: false
    });
  }
}

module.exports.nextMonthSaveEvents = async (req, res) => {
  try {
    // Retrieve cities from the database
    const cities = await City.findAll();
    const currentYear = new Date().getFullYear();

    for (const city of cities) {
      const { id, city: cityName } = city;

      for (let sum = 0; sum <= 0; sum += 10) {
        const apiCity = encodeURIComponent(cityName).replace(/%20/g, ' ');
        const apiUrl = `https://serpapi.com/search?engine=google_events&q=fitness%20events%20in%20${apiCity}&hl=en&api_key=${process.env.SERP_API}&htichips=date:next_month&start=${sum}`;

        try {
          const response = await axios.get(apiUrl);
          const apiResult = response.data.events_results;
          if (!apiResult) {
            break;
          }

          for (const result of apiResult) {
            let eventDetail = await Event.findOne({
              where: {
                link: result?.link,
                city_id: id
              }
            });
            const eventYear = result?.date?.start_date?.includes('Dec') ? currentYear + 1 : currentYear;
            const location = await getLatLongFromAddress(result.address);
            if (location) {
              result.latitude = location.latitude;
              result.longitude = location.longitude;
            }
            if (!eventDetail) {
              // Insert events into the events table
              let slug = result.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-{2,}/g, '-')
                .replace(/^-|-$/g, '');

              let count = 1;
              let existingEvent = await Event.findOne({ where: { 'events.slug': slug } });

              while (existingEvent) {
                slug = `${slug}-${count}`;
                existingEvent = await Event.findOne({ where: { 'events.slug': slug } });
                count++;
              }

              await Event.create({
                city_id: id,
                events: { ...result, slug },
                link: result?.link,
                year: eventYear
              });
            }
            else {
              let slug = result.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-{2,}/g, '-')
                .replace(/^-|-$/g, '');

              let count = 1;
              let existingEvent = await Event.findOne({ where: { 'events.slug': slug } });

              while (existingEvent) {
                slug = `${slug}-${count}`;
                existingEvent = await Event.findOne({ where: { 'events.slug': slug } });
                count++;
              }

              eventDetail.events = { ...result, slug };
              eventDetail.year = eventYear;
              await eventDetail.save();
            }
          }
        } catch (error) {
          console.error('Error making API request or processing response:', error);
        }
      }
    }
    return res.send({
      status: true
    })
  } catch (error) {
    console.error('Error syncing database or processing cities:', error);
    return res.send({
      status: false
    })
  }
}

module.exports.setFeatureEvents = async (req, res, next) => {
  try {
    const { id } = req.body;
    let message;
    if (!id) {
      return res.send({
        staus: false,
        error: "Please enter event id!"
      })
    }
    const existingRecord = await Event.findByPk(id);
    if (!existingRecord) {
      return res.send({
        staus: false,
        error: "Record not found!"
      })
    }
    if (existingRecord.isFeatured === "0") {
      await existingRecord.update({
        isFeatured: "1"
      });
      message = "Added to featured events";
    } else {
      await existingRecord.update({
        isFeatured: "0"
      })
      message = "Removed from featured events";
    }
    return res.send({
      status: true,
      message,
    });
  } catch (error) {
    console.log("error....", error);
    return res.send({
      staus: false,
      error
    })
  }
}

module.exports.getFeaturedEvents = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;
    const events = await Event.findAll({
      where: {
        isFeatured: "1"
      },
      order: [
        ['updated_at', 'DESC']
      ],
      limit,
      offset
    })
    const count = await Event.count({
      where: {
        isFeatured: "1"
      },
    })

    const totalPages = Math.ceil(count / limit);

    return res.send({
      status: true,
      message: "Record found",
      events,
      currentPage: page, totalRecords: count, totalPages
    })
  } catch (error) {
    console.log("error.....", error);
    return res.send({
      status: false,
      error
    })
  }
}

module.exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.body;
    const existingRecord = await Event.findByPk(id)
    if (!existingRecord) {
      return res.send({
        status: false,
        error: "Event not found",
      })
    }

    await existingRecord.destroy();

    return res.send({
      status: true,
      message: "Event deleted successfully"
    })

  } catch (error) {
    console.log("error........", error);
    return res.send({
      status: false,
      error
    })
  }
}

