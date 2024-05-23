	try {
		process.env.LESSONS = process.env.LESSONS ?? 1;
	
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.DUOLINGO_JWT}`,
			"user-agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
		};
	
	  const { sub } = JSON.parse(
		Buffer.from(process.env.DUOLINGO_JWT.split('.')[1], 'base64').toString(),
	  )
	
	  const getArgValue = (arg, defaultValue) => {
		return arg !== undefined ? parseInt(arg, 10) : defaultValue;
	  };
	
	  const [,, lessonsArg, minIntervalArg, maxIntervalArg] = process.argv;
	
	  const lessons = getArgValue(lessonsArg, 10); // Default value is 10
	  const minInterval = getArgValue(minIntervalArg, 10); // Default value is 10 seconds
	  const maxInterval = getArgValue(maxIntervalArg, 20); // Default value is 20 seconds
	
	  console.log('lesson: %d, minInt: %d, maxInt: %d', lessons, minInterval, maxInterval);
	
	  if (isNaN(lessons) || isNaN(minInterval) || isNaN(maxInterval)) {
		console.error('Please provide valid numbers for lessons, minInterval, and maxInterval.');
		process.exit(1);
	  }
	
	  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
	
		const { fromLanguage, learningLanguage, xpGains } = await fetch(
			`https://www.duolingo.com/2017-06-30/users/${sub}?fields=fromLanguage,learningLanguage,xpGains`,
			{
				headers,
			},
		).then((response) => response.json());
	
		let xp = 0;
		for (let i = 0; i < lessons; i++) {
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
			  skillId: xpGains.find(xpGain => xpGain.skillId).skillId, 
						smartTipsVersion: 2,
						type: "SPEAKING_PRACTICE",
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
						startTime: (+new Date() - 60000) / 1000,
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
	
		const interval = Math.random() * (maxInterval - minInterval) + minInterval;
		const intervalInMs = interval * 1000;
		console.log(`{XP: ${response.xpGain}}, Waiting for ${interval.toFixed(2)} seconds before next lesson...`);
		await sleep(intervalInMs);
		}
	
		console.log(`🎉 You won ${xp} XP`);
	} catch (error) {
		console.log("❌ Something went wrong");
		if (error instanceof Error) {
			console.log(error.message);
		}
	}