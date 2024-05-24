try {
	process.env.LESSONS = process.env.LESSONS ?? 1;

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.DUOLINGO_JWT}`,
		"user-agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
	};

	const { sub } = JSON.parse(
		Buffer.from(process.env.DUOLINGO_JWT.split(".")[1], "base64").toString(),
	);

	const { fromLanguage, learningLanguage } = await fetch(
		`https://www.duolingo.com/2017-06-30/users/${sub}?fields=fromLanguage,learningLanguage`,
		{
			headers,
		},
	).then((response) => response.json());

	console.log(fromLanguage, learningLanguage, sub);

	let xp = 0;
	let lessonCount = 0;
	
	const doLesson = async () => {
        try {
            if (lessonCount >= process.env.LESSONS) {
                console.log(`🎉 You won ${xp} XP`);
                clearInterval(lessonInterval);
                return;
            }

			const session = await fetch(
				"https://www.duolingo.com/2017-06-30/sessions",
				{
					body: JSON.stringify({
						challengeTypes: [
							"assist",
							"characterIntro",
							"characterMatch",
							"characterPuzzle",
							"characterSelect",
							"characterTrace",
							"characterWrite",
							"completeReverseTranslation",
							"definition",
							"dialogue",
							"extendedMatch",
							"extendedListenMatch",
							"form",
							"freeResponse",
							"gapFill",
							"judge",
							"listen",
							"listenComplete",
							"listenMatch",
							"match",
							"name",
							"listenComprehension",
							"listenIsolation",
							"listenSpeak",
							"listenTap",
							"orderTapComplete",
							"partialListen",
							"partialReverseTranslate",
							"patternTapComplete",
							"radioBinary",
							"radioImageSelect",
							"radioListenMatch",
							"radioListenRecognize",
							"radioSelect",
							"readComprehension",
							"reverseAssist",
							"sameDifferent",
							"select",
							"selectPronunciation",
							"selectTranscription",
							"svgPuzzle",
							"syllableTap",
							"syllableListenTap",
							"speak",
							"tapCloze",
							"tapClozeTable",
							"tapComplete",
							"tapCompleteTable",
							"tapDescribe",
							"translate",
							"transliterate",
							"transliterationAssist",
							"typeCloze",
							"typeClozeTable",
							"typeComplete",
							"typeCompleteTable",
							"writeComprehension",
						],
						fromLanguage,
						isFinalLevel: false,
						isV2: true,
						juicy: true,
						learningLanguage,
						smartTipsVersion: 2,
						type: "GLOBAL_PRACTICE",
					}),
					headers,
					method: "POST",
				},
			).then((response) => response.json());

			const response = await fetch(
				`https://www.duolingo.com/2017-06-30/sessions/${session.id}`,
				{
					body: JSON.stringify({
						...session,
						heartsLeft: 0,
						startTime: (+new Date() - 6000) / 1000,
						enableBonusPoints: false,
						endTime: +new Date() / 1000,
						failed: false,
						maxInLessonStreak: 9,
						shouldLearnThings: true,
					}),
					headers,
					method: "PUT",
				},
			).then((response) => response.json());

			xp += response.xpGain;
			lessonCount += 1;

		} catch (error) {
            console.log("❌ Something went wrong");
            if (error instanceof Error) {
                console.log(error.message);
            }
        }
    };

	const lessonInterval = setInterval(doLesson, 600); // Run every 0.6 seconds
} catch (error) {
	console.log("❌ Something went wrong");
	if (error instanceof Error) {
		console.log(error.message);
	}
}