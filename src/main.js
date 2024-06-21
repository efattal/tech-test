import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

const Cubes = new Mongo.Collection('cubes');

const propagateColor = async (cube, color, queue) => {
    if (queue.includes(cube._id)) {
        return
    }

    const { _id, x, y } = cube;


    queue.push(_id)
    
    // Line below does not refresh the view
    // Cubes.update(_id, {$set: {color}})
    // Workaround
    Cubes.remove(_id)
    Cubes.insert({ ...cube, color })
    

    const neighbours = Cubes.find({
        $or: [{
            x: x - 1,
            y,
        }, {
            x: x + 1,
            y,
        }, {
            x,
            y: y - 1,
        }, {
            x,
            y: y + 1,
        }]
    })

    neighbours.forEach(c => propagateColor(c, color, queue))
}

const randomColor = () => ({
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
})

if (Meteor.isClient) {
    Template.appBlock.onCreated(function () { });

    Template.appBlock.helpers({
        cubes() {
            return Cubes.find()
        }
    });

    Template.appBlock.events({
        "mouseup scene": function (e, instance) {
            const x = Math.round(e.worldX);
            const y = Math.round(e.worldY);

            const cube = Cubes.findOne({
                x,
                y,
            })

            if (!cube) {
                Cubes.insert({
                    x,
                    y,
                    color: randomColor()
                })
            }
            else {
                propagateColor(cube, cube.color, [])
            }
        }
    });
}

if (Meteor.isServer) {

}