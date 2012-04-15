var noteToMidi = function(note) {
	var letter = note[0];
	var num = note[1];
	var num2 = -1;
	switch (letter) {
		case 'c':
			num2 = 0;
			break;
		case 'd':
			num2 = 2;
			break;
		case 'e':
			num2 = 4;
			break;
		case 'f':
			num2 = 5;
			break;
		case 'g':
			num2 = 7;
			break;
		case 'a':
			num2 = 9;
			break;
		case 'b':
			num2 = 11;
			break;
	}

	if (num2 === -1)
		return note;

	return 12 + (12 * num) + num2;
};

var endTime = function(time, expr) {
	if (expr.tag === 'note' || expr.tag === 'rest') {
		return time + expr.dur;
	} else if (expr.tag === 'repeat') {
		return time + (expr.count * endTime(0, expr.section));
	} else if (expr.tag === 'par') {
		return time + Math.max(
			endTime(0, expr.left),
			endTime(0, expr.right));
	} else {
		return time
			+ endTime(0, expr.left)
			+ endTime(0, expr.right);
	}
};

var compileT = function(expr, notes, time) {
	if (expr.tag === 'note') {
		notes.push({ tag: 'note', pitch: noteToMidi(expr.pitch), start: time, dur: expr.dur });
	} else if (expr.tag === 'repeat') {
		var count = expr.count;
		var sectionTime = endTime(time, expr.section);
		var timeTaken = 0;
		while (count > 0) {
			notes = compileT(expr.section, notes, time + timeTaken);
			timeTaken += sectionTime;
			count--;
		}
	} else if (expr.tag === 'rest') {
		// do nothing
	} else if (expr.tag === 'par') {
		notes = compileT(expr.left, notes, time);
		notes = compileT(expr.right, notes, time);
	} else {
		notes = compileT(expr.left, notes, time);
		notes = compileT(expr.right,
				 notes,
				 endTime(time, expr.left));
	}
	return notes;
};

var compile = function(musexpr) {
	return compileT(musexpr, [], 0);
};

var melody_mus = 
    { tag: 'seq',
      left:
       { tag: 'repeat', section: 
         { tag: 'seq',
           left: { tag: 'note', pitch: 'a4', dur: 250 },
           right: { tag: 'rest', dur: 250 } },
      count: 3 },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));
