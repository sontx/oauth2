import * as winston from "winston";
import * as winstonDailyRotateFile from "winston-daily-rotate-file";

//
// Logging levels
//
const config = {
	levels: {
		error: 0,
		debug: 1,
		warn: 2,
		data: 3,
		info: 4,
		verbose: 5,
		silly: 6,
		custom: 7,
	},
	colors: {
		error: "red",
		debug: "blue",
		warn: "yellow",
		data: "grey",
		info: "green",
		verbose: "cyan",
		silly: "magenta",
		custom: "yellow",
	},
};

winston.addColors(config.colors);

const logger = winston.createLogger({
	levels: config.levels,
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize({ all: true }),
				winston.format.timestamp({
					format: "YYYY-MM-DD HH:mm:ss",
				}),
				winston.format.errors({ stack: true }),
				winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
			),
		}),
	],
});

if (process.env.NODE_ENV === "production") {
	logger.transports.push(
		new winstonDailyRotateFile({
			dirname: "logs",
			filename: "%DATE%.log",
			datePattern: "YYYY-MM-DD",
			zippedArchive: true,
			maxSize: "20m",
			maxFiles: "14d",
			level: "verbose",
			format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
		}),
	);
}

export default logger;
