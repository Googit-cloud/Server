const Note = require('../../models/Note');

exports.createNote = async (req, res, next) => {
  console.log('----쪽지----');
  console.log(req.params);
  console.log(req.body);
  const { title, content, branchId } = req.body;
  try {
    const newNote = await Note.create({
      created_by: req.params.user_id,
      parent: branchId,
      title,
      content,
    });

    console.log(newNote);

    res.status(201).json({
      result: 'ok',
      newNote
    });
  } catch (err) {
    next(err);
  }
};
