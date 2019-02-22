# Not ready for usage yet

# dat-mirror

`dat-mirror` is a service to persistently mirror your [dat](https://datproject.org/) p2p websites, intended to run on a permanently connected computer like a raspberry pi, so your sites stay available if you close your laptop.  It also serves your sites over an http mirror so anyone can see it, even on mobile.

This service uses the [discovery-swarm](https://github.com/mafintosh/discovery-swarm) p2p discovery package to make connecting to your service from anywhere easy, avoiding any port forwarding or any reliance on a third party server.

## Usage

#### Start the service on your persistent connection computer / raspberry pi, and note the mirror key
```
$ npm install -g dat-mirror
$ dat-mirror serve
> Your mirror key is <xxxxxxx>
```
#### Mirror any dat you are authoring from your client machine
If the first run, you will be asked for the mirror key from the server side step to connect to your service.
``` 
$ npm install -g dat-mirror
$ dat-mirror share <dat-key>
> Enter Mirror Key: <xxxxxxx>
> dat://<dat-key> now mirrored
> Also available at http://<yourserver.tld>/<dat-key>
```
Now your dat will be hosted by your server, and kept up to date as your site changes.

You can pass a `--subdomain` flag to `dat-mirror share` to host this dat at subdomain.yourserver.tld instead of yourserver.tld/\<dat-key\>
