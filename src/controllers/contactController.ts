import { Response } from 'express';
import CustomerContact from '../models/CustomerContact';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
export const getAllContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, limit = 100 } = req.query;

    const where: any = {};

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    const contacts = await CustomerContact.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error: any) {
    console.error('Get all contacts error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get contact by ID
// @route   GET /api/contacts/:id
// @access  Private
export const getContactById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const contact = await CustomerContact.findByPk(id);

    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact not found' });
      return;
    }

    res.json({
      success: true,
      contact
    });
  } catch (error: any) {
    console.error('Get contact error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
export const createContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phoneNumber, message } = req.body;

    if (!name || !phoneNumber) {
      res.status(400).json({ success: false, message: 'Please provide name and phone number' });
      return;
    }

    // Check if contact with same phone exists
    const existingContact = await CustomerContact.findOne({ where: { phoneNumber } });

    if (existingContact) {
      res.status(400).json({ success: false, message: 'Contact with this phone number already exists' });
      return;
    }

    const contact = await CustomerContact.create({
      name,
      phoneNumber,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      contact
    });
  } catch (error: any) {
    console.error('Create contact error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, message } = req.body;

    const contact = await CustomerContact.findByPk(id);

    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact not found' });
      return;
    }

    if (name) contact.name = name;
    if (phoneNumber) contact.phoneNumber = phoneNumber;
    if (message !== undefined) contact.message = message;

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      contact
    });
  } catch (error: any) {
    console.error('Update contact error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const contact = await CustomerContact.findByPk(id);

    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact not found' });
      return;
    }

    await contact.destroy();

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
