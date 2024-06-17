const {
  Event,
  City,
  User,
  BookEvents
} = require("../models");
const sequelize = require("sequelize");
const axios = require('axios');
const { CLIENT_RENEG_LIMIT } = require("tls");
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const { Op } = require('sequelize');
const cron = require('node-cron');



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
















module.exports.getEvents = async (req, res) => {
  try {
    let city_name = req.body.city_name;
    console.log("page", req.body.page);
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
          const combinedArray = events.map(event => {
            event.events.id = event?.id;
            event.events.year = event?.year;
            if (event.eventTickets && event.eventTickets.length > 0) {
              event.events.eventTicketsNumber = event.eventTickets.map(ticket => ticket.number);
            } else {
              event.events.eventTicketsNumber = "100";
            }
            console.log(" event.events.eventTicketsNumber", event.events.eventTicketsNumber);
            return event.events;
          });

          const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);

          res.json(flattenedArray);
        } else {
          res.json([]);
        }
      } else {
        let newCity = await City.create({
          city: city_name,
        });

        const apiCity = encodeURIComponent(city_name).replace(/%20/g, ' ');
        const apiUrl = `https://serpapi.com/search?engine=google_events&q=fitness%20events%20in%20${apiCity}&hl=en&api_key=${process.env.SERP_API}&htichips=date:month&start=0`;

        const response = await axios.get(apiUrl);
        const apiResult = response.data.events_results;
        const combinedArray = [];

        if (apiResult) {
          for (const result of apiResult) {
            let eventDetail = await Event.findOne({
              where: {
                link: result?.link,
                city_id: newCity?.id,
              },
            });

            let count = 1;

            let existingEvent = await Event.findOne({ "events.slug": { [sequelize.Op.exists]: false } }).exec();

            if (!eventDetail.events.slug) {
              let slug = result.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-{2,}/g, '-')
                .replace(/^-|-$/g, '');

              while (existingEvent) {
                slug = `${slug}-${count}`;
                existingEvent = await Event.findOne({ "events.slug": slug }).exec();
                count++;
              }
              const eventYear = result?.date?.start_date?.includes('Dec') ? currentYear + 1 : currentYear;

              result.slug = slug;
              result.year = result.year || new Date().getFullYear();
              eventDetail = await Event.create({
                city_id: newCity?.id,
                events: result,
                link: result?.link,
                year: eventYear,
              });
            } else {
              eventDetail.events = result;
              await eventDetail.save();
            }

            eventDetail.events.id = eventDetail?.id;
            combinedArray.push(eventDetail.events);
          }
        }
        const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);
        loadRestOfEvents(newCity?.id);
        res.json(flattenedArray);
      }
    } else {
      const { searchQuery } = req.body;

      const filteredEvents = await Event.findAll({
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
                { 'events.description': { [sequelize.Op.like]: `%${searchQuery}%` } }
              ]
            }
          ]
        },
        offset: offset,
        limit: limit
      });

      const combinedArray = filteredEvents.map(event => {
        event.events.id = event?.id;
        return event.events;
      });

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

      res.json({
        events: flattenedArray,
        currentPage: page,
        totalRecords: count,
        totalPages
      });
    }
  } catch (error) {
    return res.status(200).send({
      status: false,
      error,
    });
  }
};





const loadRestOfEvents = async (id) => {
  let city = await City.findByPk(id);
  const { city: cityName } = city;

  for (let sum = 10; sum <= 0; sum += 10) {
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

        if (!eventDetail) {
          // Insert events into the events table
          await Event.create({
            city_id: id,
            events: result,
            link: result?.link
          });

        }
        else {
          eventDetail.events = result;
          await eventDetail.save();
        }

      }

    } catch (error) {
      console.error('Error making API request or processing response:', error);
    }
  }
}

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


module.exports.register = async (req, res) => {
  try {
    let { name, first_name, last_name, email, location, google_id, search_location } = req.body;

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





module.exports.deleteAccount = async (req, res) => {
  try {
    const { email, google_id } = req.body;

    // Check if the user exists
    let user = await User.findOne({ where: { email, google_id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await user.destroy();

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports.getUserDetails = async (req, res) => {
  try {
    let user_id = req.params.id;
    let userFind = await User.findOne({
      where: {
        id: user_id
      }
    });
    if (!userFind) {
      throw 'No user found!';
    }
    let user = {
      id: userFind?.id,
      name: userFind?.full_name,
      first_name: userFind?.first_name,
      last_name: userFind?.last_name,
      location: userFind?.location,
      search_location: userFind?.search_location, // Include search_location
      email: userFind?.email,
      phone_no: userFind?.phone_no,
      profile_image: `${userFind?.profile_image ? `${process.env.IMAGE_BASEURL}/${userFind?.profile_image}` : null}`,
      stripeCustomerId: userFind?.stripeCustomerId,
      stripeAccountId: userFind?.stripeAccountId,
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

