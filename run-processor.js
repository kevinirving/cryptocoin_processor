var daemon = require("daemonize2").setup({
    main: "main.js",
    name: "processor",
    argv: ['processor'],
    pidfile: "processor.pid"
});

switch (process.argv[2]) {

    case "start":
        daemon.start();
        break;

    case "stop":
        daemon.stop();
        break;

    default:
        console.log("Usage: [start|stop]");
}
