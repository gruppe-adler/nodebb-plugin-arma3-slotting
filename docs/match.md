# match definition


Matches are being defined using an XML structure, with the root element being `<match>`


## structure

Matches may contain the following elements:

### <company>

### <platoon>

### <squad>

### <fireteam>

### <slot>

## attributes

### block slots until a certain number of players has been reached

Set a integer `min-slotted-player-count` attribute to a slot or containing unit.
Example:

```xml
<squad min-slotted-player-count="2">
	<slot></slot>
	<slot min-slotted-player-count="1"></slot>
</squad>
```

The first slot will be available from 2 already slotted players upwards; 
whereas the second one will be available from the first slotted player.
