const {
  Event,
  City,
  User,
  BookEvents
} = require("../models");
const sequelize = require("sequelize");
const axios = require('axios');
const { CLIENT_RENEG_LIMIT } = require("tls");



// module.exports.getEvents = async (req, res) => {
//   try {
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



module.exports.getEvents = async (req, res) => {
  try {
    let city_name = req.body.city_name;
    console.log("page", req.body.page);
    let page = parseInt(req.body.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

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

        // console.log('offset', offset);
        // console.log('events', events);

        if (events && events.length > 0) {
          const combinedArray = events.map(event => {
            event.events.id = event?.id;
            if (event.eventTickets && event.eventTickets.length > 0) {
              event.events.eventTicketsNumber = event.eventTickets.map(ticket => ticket.number);
            } else {
              event.events.eventTicketsNumber = "100";
            }
            console.log(" event.events.eventTicketsNumber",  event.events.eventTicketsNumber);
            return event.events;
          });

          const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);
          res.json(flattenedArray);
        } else {
          res.json([]);
        }
      } else {
        let city = await City.create({
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
                city_id: city?.id,
              },
            });

            if (!eventDetail) {
              const slug = result.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-{2,}/g, '-')
                .replace(/^-|-$/g, '');
              result.slug = slug
              eventDetail = await Event.create({
                city_id: city?.id,
                events: result,
                link: result?.link,
              });
              console.log("slug", eventDetail.slug);
            } else {
              eventDetail.events = result;
              await eventDetail.save();
            }

            eventDetail.events.id = eventDetail?.id;
            combinedArray.push(eventDetail.events);
          }
        }
        const flattenedArray = combinedArray.reduce((acc, curr) => acc.concat(curr), []);
        loadRestOfEvents(city?.id);
        res.json(flattenedArray);
      }
    } else {
      const { searchQuery } = req.body;
      // console.log("searchQuery", req.body);
      // console.log("working.......");

      const filteredEvents = await Event.findAll({
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
        },
        offset: offset,
        limit: limit
      });

      console.log("filteredEvents", filteredEvents.length);
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
    // const eventTickets = eventData.eventTickets || []; 
    // for (const ticket of eventTickets) {
    //   const ticketNumber = ticket.number; 
    //   console.log("Ticket Number:", ticketNumber);
    // }

    // console.log("Event ID:", eventId); 
    // const eventDetails = await Event.findByPk(eventId);
    // console.log("Event Details:", eventDetails); 


    // let totalTicketsAvailable = 0;
    // for (const ticket of eventTickets) {
    //   totalTicketsAvailable += parseInt(ticket.number);
    // }
    // console.log("Total tickets available for the event:", totalTicketsAvailable);

    // const countAllBookedTickets = await BookEvents.count({ where: { eventId: eventId } });
    // console.log("Count of all booked tickets for eventId:", countAllBookedTickets);

    // totalTicketsAvailable -= countAllBookedTickets;
    // console.log("Total tickets available after deduction:", totalTicketsAvailable);

    // res.json({ totalTicketsAvailable: totalTicketsAvailable });

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

module.exports.register = async (req, res) => {
  try {
    let full_name = req.body.name;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let location = req.body.location;
    let google_id = req.body.google_id;

    let userFind = await User.findOne({
      where: {
        email,
        google_id
      }
    });

    if (!userFind) {
      userFind = await User.create({
        full_name,
        location,
        email,
        google_id,
        first_name,
        last_name
      });
    } else {
      userFind = await User.update(
        {
          full_name,
          location,
        },
        {
          where: {
            email
          }
        }
      );

      userFind = await User.findOne({
        where: {
          email
        }
      });
    }

    let user = {
      id: userFind?.id,
      name: userFind?.full_name,
      location: userFind?.location,
      email: userFind?.email,
      phone_no: userFind?.phone_no,
      profile_image: `${userFind?.profile_image ? `${process.env.IMAGE_BASEURL}/${userFind?.profile_image}` : null}`,
      first_name: userFind?.first_name,
      last_name: userFind?.last_name
    };

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
      throw 'No user found!'
    }
    let user = {
      id: userFind?.id,
      name: userFind?.full_name,
      first_name: userFind?.first_name,
      last_name: userFind?.last_name,
      location: userFind?.location,
      email: userFind?.email,
      phone_no: userFind?.phone_no,
      profile_image: `${userFind?.profile_image ? `${process.env.IMAGE_BASEURL}/${userFind?.profile_image}` : null}`,
    }
    return res.status(200).send({
      status: true,
      user
    })
  } catch (error) {
    return res.status(200).send({
      status: false,
      error
    })
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

            if (!eventDetail) {
              // Insert events into the events table
              await Event.create({
                city_id: id,
                events: result,
                link: result?.link
              });

            } else {
              eventDetail.events = result;
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

module.exports.nextMonthSaveEvents = async (req, res) => {
  try {
    // Retrieve cities from the database
    const cities = await City.findAll();

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

