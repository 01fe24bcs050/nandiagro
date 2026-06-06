import Query from '../models/Query.js';
import { sendQueryConfirmationEmail } from '../utils/emailService.js';

// Create a new query
export const createQuery = async (req, res) => {
  try {
    const { name, email, query } = req.body;

    if (!name || !email || !query) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newQuery = new Query({
      name,
      email,
      query,
    });

    await newQuery.save();

    // Send confirmation email
    await sendQueryConfirmationEmail(email, name, query);

    res.status(201).json({
      message: 'Query submitted successfully',
      query: newQuery,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all queries (admin only)
export const getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single query
export const getQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.status(200).json(query);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update query (admin - reply and mark as resolved)
export const updateQuery = async (req, res) => {
  try {
    const { reply, status } = req.body;
    const query = await Query.findByIdAndUpdate(
      req.params.id,
      { reply, status },
      { new: true }
    );

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.status(200).json({ message: 'Query updated successfully', query });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a query
export const deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.status(200).json({ message: 'Query deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
