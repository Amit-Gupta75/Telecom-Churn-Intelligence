import Interaction from "../models/Interaction.js";

export const listInteractions = async (req, res) => {
  try {
    const items = await Interaction.find({ customer: req.params.customerId }).sort({ occurredAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addInteraction = async (req, res) => {
  try {
    const item = await Interaction.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeInteraction = async (req, res) => {
  try {
    await Interaction.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
