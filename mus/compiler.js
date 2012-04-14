var noteToMidi = function(note) {
	var letter = note[0];
	var num = note[1];

	return 12 + (12 * num) + letterToNum(letter);
};

var letterToNum = function(letter) {
	switch (letter) {
		case 'c':
			return 0;
		case 'd':
			return 2;
		case 'e':
			return 4;
		case 'f':
			return 5;
		case 'g':
			return 7;
		case 'a':
			return 9;
		case 'b':
			return 11;
	}
};

var endTime = function(time, expr) {
	if (expr.tag === 'note' || expr.tag === 'rest') {
		return time + expr.dur;
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
		expr.start = time;
		expr.pitch = noteToMidi(expr.pitch);
		notes.push(expr);
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
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'rest', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));
