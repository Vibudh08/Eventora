import Event from "../models/Event.js";

export const getEvents = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    const filters = {};
    if (search) {
      filters.$or = [{ name: { $regex: search, $options: "i" } }];
    }
    if (req.query.category) {
      filters.category = { $regex: req.query.category.trim(), $options: "i" };
    }
    if (req.query.location) {
      filters.location = { $regex: req.query.location.trim(), $options: "i" };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filters.ticketPrice = {};

      if (req.query.minPrice) {
        filters.ticketPrice.$gte = Number(req.query.minPrice);
      }

      if (req.query.maxPrice) {
        filters.ticketPrice.$lte = Number(req.query.maxPrice);
      }
    }
    const allEvents = await Event.find(filters);
    return res.status(200).json(allEvents);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findById(id);
    if (event) {
      return res.json(event);
    } else {
      return res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create({
      name: req.body.name,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      category: req.body.category,
      totalSeats: req.body.totalSeats,
      ticketPrice: req.body.ticketPrice,
      availableSeats: req.body.availableSeats,
      imageUrl: req.body.imageUrl,
      createdBy: req.user._id,
    });
    return res.status(201).json(newEvent);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (updatedEvent) {
      return res.json(updatedEvent);
    } else {
      return res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (deletedEvent) {
      return res.json({ message: "Event deleted successfully" });
    } else {
      return res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
