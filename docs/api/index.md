## general notes

* the API takes and returns XML as well as JSON – the latter is more easily consumed by Javascript applications, while the former is easier to read and understand.
	* for this to work, set the `Content-Type` and `Accept` headers to `application/xml` or `application/json`, respectively.
* The complete match structure is [defined in a DTD](../../lib/match.dtd)

### GET /arma3-slotting/:tid

returns matches as array of URLs

return code:
* 200 
* 404 if thread does not exist

### POST /arma3-slotting/:tid/match

add new match. returns new match ID.

return code:
* 200 if created
* 400 if invalid structure

### PUT /arma3-slotting/:tid/match/:matchid 

sets complete slot structure as JSON or XML

if the match existed before and has slots filled, this will clear them

return code:
* 204 if created
* 400 if invalid structure

 
### PUT /arma3-slotting/:tid/match/:matchid

set complete match structure as JSON or XML

if the match existed before and had slots filled, the occupants will be set again (unless explicitly filled by the PATCH)

return code:
* 200 if patched
* 400 if invalid structure

### GET /arma3-slotting/:tid/match/:matchid

returns complete slot structure as JSON or XML

### PUT /arma3-slotting/:tid/match/:matchid/slot/:slotid/user
 
`{uid: 5}`

return code: 
* 204 for success
* 409 if user is already slotted elsewhere
* 400 if user doesnt exist
* 404 if slot doesnt exist

### DELETE /arma3-slotting/:tid/match/:matchid/slot/:slotid/user

removes user from slot

### PUT /arma3-slotting/:tid/match/:matchid/slot/:slotid/reservation

`{"reserved-for": "tf47"}`

return codes:

* 204 for success
* 404 if slot doesnt exist

### DELETE /arma3-slotting/:tid/match/:matchid/slot/:slotid/reservation

removes reservation
