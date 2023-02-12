//the root Vue instance
let webstore = new Vue({
  el: "#app", // links to the div
  // the data option
  data: {
    sitename: "activitystore", // defines sitename
    products: [],
    order: {
      //order details
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      method: "Home",
      gift: "Send as a gift",
      sendGift: "Send as a gift",
      dontSendGift: "Do not send as a gift",
      cart: "",
    }, //order locations
    states: {
      DXB: "Dubai",
      SHJ: "Sharjah",
      ADH: "Abu Dhabi",
    }, //sort options
    sort: {
      by: "Price",
      order: "a",
    },
    search: "",
    cart: [], //creating cart array
    showProduct: true,
    showPlaceOrder: false,
    displayCart: [],
    results: [],
  },
  // the methods option
  methods: {
    //method for adding item
    addItem(product) {
      if (product.space > 0) {
        product.displaySpace -= 1;
        this.cart.push(product.id);
        this.displayCart.push({
          id: product.id,
          title: product.title,
          location: product.location,
          price: product.price,
          image: product.image,
          rating: product.rating,
        });
      }
    },
    //method for showing cart page
    showCheckout() {
      this.showProduct = this.showProduct ? false : true;
    },
    //method for disabling add to cart button
    canAdd(product) {
      return product.space > this.cartCount(product.id);
    },
    //method for checking number of same items in cart
    cartCount(id) {
      let count = 0;
      for (let i = 0; i < this.cart.length; i++) {
        if (this.cart[i] === id) {
          count++;
        }
      }
      return count;
    },
    //method for placing order
    submitForm() {
      let order = [];
      var count = {};

      for (var i = 0; i < this.displayCart.length; i++) {
        if (
          this.displayCart[i].title + "[" + this.displayCart[i].id + "]" in
          count
        ) {
          count[
            this.displayCart[i].title + "[" + this.displayCart[i].id + "]"
          ]++;
        } else {
          count[
            this.displayCart[i].title + "[" + this.displayCart[i].id + "]"
          ] = 1;
        }
      }

      for (var title in count) {
        order.push(title + " X " + count[title]);
      }

      let text = "";

      for (let i = 0; i < order.length; i++) {
        text += order[i] + ", ";
      }

      this.order.cart = text.slice(0, -2);

      fetch("http://localhost:3000/collection/orders", {
        method: "POST",
        body: JSON.stringify({
          coursestaken: this.order.cart,
          totalcourses: this.cart.length,
          firstName: this.order.firstName,
          lastName: this.order.lastName,
          address: this.order.address,
          city: this.order.city,
          phone: this.order.phone,
          emirate: this.order.state,
          gift: this.order.gift,
          method: this.order.method,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch((error) => console.error(error));

      fetch("http://localhost:3000/lessons", {
        method: "PUT",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(this.products),
      })
        .then((response) => response.json())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));

      this.showPlaceOrder = true;
    },
    //method for removing item from cart
    removeItem(product) {
      const objWithIdIndex = this.displayCart.findIndex(
        (obj) => obj.id === product.id
      );
      this.displayCart.splice(objWithIdIndex, 1);

      const index = this.cart.indexOf(product.id);
      if (index > -1) {
        // only splice array when item is found
        this.cart.splice(index, 1); // 2nd parameter means remove one item only
      }

      for (let j = 0; j < this.products.length; j++) {
        if (product.id === this.products[j].id) {
          this.products[j].displaySpace += 1;
        }
      }

      return this.displayCart;
    },
  },
  computed: {
    cartItemCount() {
      return this.cart.length || "";
    },
    //method for enabling cart page button
    canCheckOut() {
      return this.cart.length != 0;
    },
    //method for enabling place order button
    canPlaceOrder() {
      return (
        this.order.firstName.match(/^[A-Za-z]+$/) &&
        this.order.lastName.match(/^[A-Za-z]+$/) &&
        this.order.address != "" &&
        this.order.city.match(/^[A-Za-z]+$/) &&
        this.order.phone != "" &&
        this.order.state != ""
      );
    },
    //method for searching and sorting products
    sortedProducts() {
      if (this.search !== "") {
        fetch("http://localhost:3000/search", {
          method: "POST",
          body: JSON.stringify({
            search: this.search,
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            //console.log(data);
            webstore.results = data;
          })
          .catch((error) => console.error(error));

        // console.log(this.results);

        //return this.products.filter((item) => this.results.includes(item.id));

        return this.products.filter((obj1) => {
          return this.results.some((obj2) => {
            return obj1.id === obj2.id;
          });
        });
      } else {
        switch (this.sort.order) {
          case "a":
            x = 1;
            y = -1;
            break;
          case "d":
            x = -1;
            y = 1;
            break;
        }

        if (this.sort.by == "Subject") {
          function compare(a, b) {
            if (a.title > b.title) return x;
            if (a.title < b.title) return y;
            return 0;
          }
        } else if (this.sort.by == "Location") {
          function compare(a, b) {
            if (a.location > b.location) return x;
            if (a.location < b.location) return y;
            return 0;
          }
        } else if (this.sort.by == "Price") {
          function compare(a, b) {
            if (a.price > b.price) return x;
            if (a.price < b.price) return y;
            return 0;
          }
        } else if (this.sort.by == "Space") {
          function compare(a, b) {
            if (a.displaySpace > b.displaySpace) return x;
            if (a.displaySpace < b.displaySpace) return y;
            return 0;
          }
        }

        return this.products.sort(compare);
      }
    },
  },
  created: function () {
    console.log("requesting data from the server ...");
    // retrieving data from the server
    fetch("http://localhost:3000/lessons").then(function (response) {
      response.json().then(function (json) {
        // storing the response
        webstore.products = json;
      });
    });
  },
});
