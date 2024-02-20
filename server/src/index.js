let express = require("express");
const path = require("path");

const multer = require("multer")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // if(req.url=='/api/create-article' || req.url=='/api/update-article'){
    //   cb(null, "newsArticles/");
    // }else{
      cb(null, "uploads/");
    // }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const uploadStorage = multer({ storage: storage })

// const Configuration = require("./dbconfig");

const router = express.Router();

/*** Application Controllers ***/
const ApiController = require("./controllers/ApiController");
const customController = require("./controllers/customController");
const NewsAriclesController = require("./controllers/NewsAriclesController");
const NewsLetterController = require("./controllers/NewsLetterController");
const FaqControlller = require("./controllers/FaqControlller");
const AppInfoController = require("./controllers/AppInfoController");
const EventCategory = require("./controllers/EventCategory");

/*** Application models ***/
const { demoEvent } = require("./models");




/*** Auth Routers ***/
router.post("/api/get-event", ApiController.getEvents);
router.get("/api/event-detail/:id", ApiController.eventDetails);
router.get("/save-event", ApiController.saveEvents);
router.get("/save-weekly-event", ApiController.saveWeeklyEvents);
router.get("/next-month-save-event", ApiController.nextMonthSaveEvents);

router.post("/api/register",ApiController.register);
router.post("/api/deleteAccount",ApiController.deleteAccount);

router.post("/api/update-user/:id",uploadStorage.single("profile_image"),ApiController.updateUser);
router.get("/api/get-user-details/:id",ApiController.getUserDetails);



router.post("/api/update-feature-event",ApiController.setFeatureEvents);
router.get("/api/get-feature-event",ApiController.getFeaturedEvents);
// router.post("/api/delete-event",ApiController.deleteEvent);



// for custom controller routes
router.get("/api/event-listing/:id", customController.eventListing);
router.post("/api/add-event", customController.insertEvent);
router.post("/api/edit-event", customController.updateEvent);
router.post("/api/add-event-image/:id", uploadStorage.single("event_image"), customController.insertImage);
router.get("/api/delete-event/:id", customController.deleteEvent);
router.post("/api/book-event",customController.bookEvent);
router.get("/api/fetch-booked-event", customController.fetchAllBookedEvents);
router.get("/api/fetch-event-ticket-availability", customController.fetchAvailableEvents);
router.get('/api/event/:eventId/attendees', customController.fetchAttendeesByEventId);
router.post('/api/create-payment-intent', customController.createPaymentIntent);
router.post('/api/payment_intents/:id/confirm', customController.confirmPaymentIntent);
router.get('/api/payment_intents', customController.listPaymentIntents);
router.post('/api/payment_methods', customController.PaymentMethods);
router.post('/api/update-stripe-card-info', customController.updateCardInfo);
router.get('/api/get-customers', customController.getCustomers);


// for ejs template routes
// router.get('/', function (req,res, next)  {
//   demoEvent.findAll({ limit: 10 }).then(events => {
//       res.render("home", {data: events})
//     });
//   })    

//   router.get('/event-description/:id/:title', function (req,res, next)  {
//     const eventId = req.params.id; 
//     demoEvent.findByPk(eventId).then(event => {
//       // console.log("event>>>>>>>>>",event)
//       res.render("single-event", {data: event})
//     }).catch(err => {
//       res.send("<p>No result found</p>");
//     });
//   }) 
  
//   router.use('/robots.txt', function (req, res, next) {
//     res.type('text/plain')
//     res.send("User-agent: *\nDisallow: /");
// });


/** Event category */
router.post('/api/create-event-category',EventCategory.createEventCategory);
router.post('/api/update-event-category',EventCategory.updateEventCategory);
router.post('/api/delete-event-category',EventCategory.deleteEventCategory);
router.get('/api/get-event-category',EventCategory.getEventCategory);
/** */





/** News Articles Category*/
router.post('/api/create-article-category',NewsAriclesController.createArticleCategory);
router.post('/api/update-article-category',NewsAriclesController.updateArticleCategory);
router.post('/api/delete-article-category',NewsAriclesController.deleteArticleCategory);
router.get('/api/get-article-category',NewsAriclesController.getArticleCategory);
/** */




// news NewsArticles
router.post('/api/get-articles',NewsAriclesController.getNews);
router.post('/api/get-articles-by-category',NewsAriclesController.getArticleByCategory);
router.get('/api/view-article/:id',NewsAriclesController.viewNews);
router.post('/api/create-article',uploadStorage.single("image"),NewsAriclesController.createNewsArticle);
router.post('/api/update-article',uploadStorage.single("image"),NewsAriclesController.updateNewsArticle);
router.post('/api/delete-article',uploadStorage.none(),NewsAriclesController.deleteNewsArticle);

// 

/** NewsLetter*/

router.post("/api/subscribe-newsletter",NewsLetterController.subscribe_newsLetter)
router.post("/api/unsubscribe-newsletter",NewsLetterController.unsubscribe_newsLetter)
/** */

/** faq*/
router.post('/api/create-faq',FaqControlller.createfaq);
router.post('/api/update-faq',FaqControlller.updateFaq);
router.post('/api/delete-faq',FaqControlller.deletefaq);
router.get('/api/get-faq',FaqControlller.getfaq);
/** */


/**About */

router.get("/api/get-app-info",AppInfoController.getInfo)
router.post("/api/update-app-info",AppInfoController.updateAbout)

module.exports = router;