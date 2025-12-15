// backend/src/controllers/reportController.js
import Report from "../models/Report.js";
import Booking from "../models/Booking.js";

// @desc Get reports (optionally by status)
export const getReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const reports = await Report.find(filter)
      .populate("component")
      .populate("room")
      .populate("reportedBy", "name email");
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create report (HR only)
export const createReport = async (req, res) => {
  try {
    const reportData = { ...req.body, reportedBy: req.user._id };
    const report = await Report.create(reportData);
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc Update report status (Admin)
export const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get meeting summary report
export const getMeetingSummary = async (req, res) => {
  try {
    const { startDate, endDate, status, roomId } = req.query;
    
    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }
    if (status) filter.status = status;
    if (roomId) filter.room = roomId;
    
    // Fetch bookings
    const bookings = await Booking.find(filter)
      .populate("room", "name")
      .lean();
    
    // Calculate duration for each booking
    const bookingsWithDuration = bookings.map(booking => {
      const start = booking.startTime.split(':').map(Number);
      const end = booking.endTime.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      const duration = endMinutes - startMinutes;
      
      return {
        ...booking,
        duration: Math.max(duration, 0),
      };
    });
    
    // Calculate KPIs
    const totalMeetings = bookingsWithDuration.length;
    const canceledMeetings = bookingsWithDuration.filter(b => b.status === 'canceled').length;
    const durations = bookingsWithDuration
      .filter(b => b.status !== 'canceled')
      .map(b => b.duration)
      .filter(d => d > 0);
    
    const averageDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;
    
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const medianDuration = sortedDurations.length > 0
      ? sortedDurations[Math.floor(sortedDurations.length / 2)]
      : 0;
    
    const cancellationRate = totalMeetings > 0 ? (canceledMeetings / totalMeetings) * 100 : 0;
    
    // Generate time series data (meetings over time)
    const meetingsOverTime = [];
    const dateMap = {};
    bookingsWithDuration.forEach(booking => {
      const dateKey = booking.date;
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
    });
    
    Object.entries(dateMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([date, count]) => {
        meetingsOverTime.push({ date, count });
      });
    
    // Status distribution
    const now = new Date();
    const statusCounts = {
      'Booked': 0,
      'Canceled': 0,
      'Completed': 0,
      'Upcoming': 0,
    };
    
    bookingsWithDuration.forEach(booking => {
      if (booking.status === 'canceled') {
        statusCounts['Canceled']++;
      } else {
        const bookingDateTime = new Date(`${booking.date}T${booking.endTime}`);
        if (bookingDateTime > now) {
          statusCounts['Upcoming']++;
        } else {
          statusCounts['Completed']++;
        }
      }
    });
    
    const statusDistribution = Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
    
    // Meetings per period (weekly)
    const meetingsPerPeriod = [];
    const weekMap = {};
    bookingsWithDuration.forEach(booking => {
      const date = new Date(booking.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    });
    
    Object.entries(weekMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([period, count]) => {
        meetingsPerPeriod.push({ period, count });
      });
    
    res.status(200).json({
      totalMeetings,
      averageDuration,
      medianDuration,
      cancellationRate,
      meetingsOverTime,
      statusDistribution,
      meetingsPerPeriod,
      rawData: bookingsWithDuration.map(b => ({
        _id: b._id,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        duration: b.duration,
        room: b.room,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
